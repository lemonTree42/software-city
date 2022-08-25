// @ts-nocheck
import {ProjectDataProxy} from '../../../../src/dataLayer/githubProxy/projectDataProxy';
import {CommonStateStatus} from '../../../../src/presentation/application/states/stateStatus';
import {UnprocessedDirectory, UnprocessedFile} from '../../../../src/dataLayer/model/projectData/unprocessed/internal';

let workerPostMessageCallCounter = 0;

const worker = {
  postMessage: () => {
    workerPostMessageCallCounter++;
    return {};
  },
  terminate: () => ({}),
};

class ProjectDataProxyTest extends ProjectDataProxy {
  public async createJavaFileCollectorWorker(): Promise<Worker> {
    return new Promise((res) => {
      res(worker);
    });
  }
}

describe('ProjectDataProxy Test Suite', function() {
  let javaFileCollector: ProjectDataProxyTest | null = null;
  let dataContextCallCounter;
  const dataContextMock = {
    getGithubInformation: () => {
      dataContextCallCounter++;
      return {
        getUsername: () => 'username',
        getRepository: () => 'repository',
      };
    },
    setUnprocessedProject: function(data) {
      this.result = data;
    },
  };
  const faultyDataContextMock = {
    getGithubInformation: () => {
      return null;
    },
  };
  const stateMock = {
    finish: function(status) {
      this.result = status;
    },
    isCancelled: () => false,
  };
  beforeEach(() => {
    javaFileCollector = new ProjectDataProxyTest(stateMock, dataContextMock);
    dataContextMock.result = undefined;
    dataContextCallCounter = 0;
    workerPostMessageCallCounter = 0;
  });
  test.only('should create worker and post a message to worker', async () => {
    await javaFileCollector!.writeData();
    expect(dataContextCallCounter).toBe(1);
    expect(workerPostMessageCallCounter).toBe(1);
  });
  test.only('should handle if no GithubInformation available', async () => {
    javaFileCollector = new ProjectDataProxyTest(stateMock, faultyDataContextMock);
    await javaFileCollector!.writeData();
    expect(stateMock.result).toBe(CommonStateStatus.error);
  });
  test.only('should set result in DataContext', async () => {
    const expected = new UnprocessedDirectory('test', 'test');
    const file = new UnprocessedFile('test', 'test');
    expected.addComponent(file);
    await javaFileCollector!.writeData();
    worker.onmessage({data: {directory: {path: 'test', content: [{javaFile: {path: 'test', content: 'test'}}]}}});
    expect(dataContextMock.result).toEqual(expected);
  });
  test.only('should not set result in DataContext if state cancelled', async () => {
    stateMock.isCancelled = () => true;
    await javaFileCollector!.writeData();
    worker.onmessage({data: {javaFile: {path: 'test', content: 'test'}}});
    expect(dataContextMock.result).toBeUndefined();
  });
});
