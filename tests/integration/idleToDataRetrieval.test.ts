// @ts-nocheck
import {IdleState} from '../../src/presentation/application/states/idleState';
import {DataContext} from '../../src/presentation/application/dataContext';
import {DataRetrievalState} from '../../src/presentation/application/states/dataRetrievalState';
import {ProjectDataProxy} from '../../src/dataLayer/githubProxy/projectDataProxy';

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

const worker = {
  postMessage: () => {},
};

class DataRetrievalStateTest extends DataRetrievalState {
  public createProjectDataProxy(): ProjectDataProxy {
    return projectDataProxyTest;
  }
}

const dataRetrievalStateTest = new DataRetrievalStateTest(appMock, dataContext);

class IdleStateTest extends IdleState {
  public createNextState(): DataRetrievalState {
    return dataRetrievalStateTest;
  }
}

class ProjectDataProxyTest extends ProjectDataProxy {
  private async createJavaFileCollectorWorker(): Promise<Worker> {
    return new Promise((res) => {
      res(worker);
    });
  }
  private getGithubInformation() {
    const githubInformation = this.dataContext.getGithubInformation();
    const username = githubInformation.getUsername();
    const repository = githubInformation.getRepository();
    this.username = username;
    this.repository = repository;
    return {username, repository};
  }
}

const projectDataProxyTest = new ProjectDataProxyTest(dataRetrievalStateTest, dataContext, () => {});

describe('Integration Test Suite IdleState and DataRetrievalState', function() {
  test.only('IdleState should write GithubInformation - DataRetrievalState should read previously written GithubInformation', async () => {
    new IdleStateTest(appMock, dataContext);
    htmlControllerMock.onBuildCityClicked();
    const projectDataProxy = dataRetrievalStateTest.createProjectDataProxy();
    await projectDataProxy.writeData();
    expect(projectDataProxy.username).toBe('fred');
    expect(projectDataProxy.repository).toBe('freds-repo');
  });
});
