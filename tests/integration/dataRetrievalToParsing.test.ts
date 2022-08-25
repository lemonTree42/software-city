// @ts-nocheck
import {DataContext} from '../../src/presentation/application/dataContext';
import {DataRetrievalState} from '../../src/presentation/application/states/dataRetrievalState';
import {ProjectDataProxy} from '../../src/dataLayer/githubProxy/projectDataProxy';
import {ParsingState} from '../../src/presentation/application/states/parsingState';
import {JavaAnalyzer} from '../../src/businessLogic/codeAnalyzer/javaAnalyzer';
import {CommonStateStatus} from '../../src/presentation/application/states/stateStatus';
import {UnprocessedComponent} from '../../src/dataLayer/model/projectData/unprocessed/unprocessedComponent';

const unprocessedMock = {
  directory: {
    path: 'path',
    content: [{
      javaFile: {
        path: 'file',
        content: 'content',
      },
    }],
  },
};

const dataContext = new DataContext();

const htmlControllerMock = {
  resetHtml: () => {},
  onBuildCityClicked: () => {
    dataContext.setGithubInformation('fred', 'freds-repo');
  },
};

const appMock = {
  currentState: '',
  updateState: function(state) {
    this.currentState = state.constructor.name;
  },
  getHtmlController: () => htmlControllerMock,
  getBabylonJsController: () => {},
  subscribeToBabylonJsLoaded: () => {},
  lazyLoadBabylonJs: () => {},
};

class ProjectDataProxyTest extends ProjectDataProxy {
  public async writeData(): Promise<void> {
    const result = UnprocessedComponent.fromDTO(unprocessedMock);
    this.dataContext.setUnprocessedProject(result);
  }
}

class DataRetrievalStateTest extends DataRetrievalState {
  public createNextState(): ParsingState {
    return parsingStateTest;
  }
  public createProjectDataProxy(): ProjectDataProxy {
    return new ProjectDataProxyTest(this, this.dataContext, () => {});
  }
}

class ParsingStateTest extends ParsingState {
  public async start(): Promise<void> {
    await super.start();
    this.unprocessed = this.dataContext.getUnprocessedProject();
  }
  public createJavaAnalyzer(): JavaAnalyzer {
    return new JavaAnalyzer(this, this.dataContext, (name) => this.onFileParseError(name));
  }
}

const parsingStateTest = new ParsingStateTest(appMock, dataContext);

describe('Integration Test Suite DataRetrievalState and ParsingState', function() {
  test.only('DataRetrievalState should write UnprocessedProject - ParsingState should read previously written UnprocessedProject', async () => {
    dataContext.setGithubInformation('fred', 'freds-repo');
    const state = new DataRetrievalStateTest(appMock, dataContext);
    await state.start();
    state.finish(CommonStateStatus.success);
    await parsingStateTest.start();
    expect(parsingStateTest.unprocessed.toDTO()).toEqual(unprocessedMock);
  });
});
