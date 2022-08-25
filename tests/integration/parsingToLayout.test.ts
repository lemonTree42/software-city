// @ts-nocheck
import {CommonStateStatus} from '../../src/presentation/application/states/stateStatus';
import {DataContext} from '../../src/presentation/application/dataContext';
import {ParsingState} from '../../src/presentation/application/states/parsingState';
import {JavaAnalyzer} from '../../src/businessLogic/codeAnalyzer/javaAnalyzer';
import {LayoutBuildingState} from '../../src/presentation/application/states/layoutBuildingState';
import {ProcessedComponent} from '../../src/dataLayer/model/projectData/processed/processedComponent';

const processedMock = {
  package: {
    name: 'package',
    content: [],
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

class LayoutBuildingStateTest extends LayoutBuildingState {
  public async start(): Promise<void> {
    this.processed = this.dataContext.getProcessedProject();
  }
}

const layoutBuildingStateTest = new LayoutBuildingStateTest(appMock, dataContext);

class ParsingStateTest extends ParsingState {
  public createJavaAnalyzer(): JavaAnalyzer {
    return new JavaAnalyzerTest(this, this.dataContext, (name) => this.onFileParseError(name));
  }
  public createNextState(): LayoutBuildingState {
    return layoutBuildingStateTest;
  }
}

class JavaAnalyzerTest extends JavaAnalyzer {
  public async writeProcessedProject(): Promise<void> {
    this.dataContext.setProcessedProject(ProcessedComponent.fromDTO(processedMock));
  }
}

describe('Integration Test Suite ParsingState and LayoutBuildingState', function() {
  test.only('ParsingState should write ProcessedProject - LayoutBuildingState should read previously written ProcessedProject', async () => {
    dataContext.setGithubInformation('fred', 'freds-repo');
    dataContext.setUnprocessedProject({
      directory: {
        path: 'path',
        content: [],
      },
    });
    const state = new ParsingStateTest(appMock, dataContext);
    await state.start();
    state.finish(CommonStateStatus.success);
    await layoutBuildingStateTest.start();
    expect(layoutBuildingStateTest.processed.toDTO()).toEqual(processedMock);
  });
});
