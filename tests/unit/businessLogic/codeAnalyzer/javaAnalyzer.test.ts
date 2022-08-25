// @ts-nocheck
import {JavaClass, Metrics} from '../../../../src/dataLayer/model/projectData/processed/internal';
import {JavaAnalyzer} from '../../../../src/businessLogic/codeAnalyzer/javaAnalyzer';
import {DataContextError} from '../../../../src/utils/errorhandling/Errors';
import {CommonStateStatus} from '../../../../src/presentation/application/states/stateStatus';

let workerPostMessageCallCounter = 0;

const worker = {
  postMessage: (arg) => {
    workerPostMessageCallCounter++;
    return {};
  },
  terminate: () => ({}),
};

class JavaAnalyzerTest extends JavaAnalyzer {
  public async createJavaAnalyzerWorker(): Promise<Worker> {
    return new Promise((res) => {
      res(worker);
    });
  }
}

describe('JavaAnalyzer Test Suite', function() {
  let javaAnalyzer: JavaAnalyzerTest | null = null;
  let dataContextCallCounter;
  let dataContextMock;
  let stateMock;
  beforeEach(() => {
    dataContextMock = {
      getUnprocessedProject: function() {
        dataContextCallCounter++;
        return {toDTO: () => ({})};
      },
      setProcessedProject: function(data) {
        this.result = data;
      },
    };
    stateMock = {
      finish: function(status) {
        this.result = status;
      },
      isCancelled: () => false,
    };
    javaAnalyzer = new JavaAnalyzerTest(stateMock, dataContextMock);
    dataContextMock.result = undefined;
    stateMock.result = undefined;
    dataContextCallCounter = 0;
    workerPostMessageCallCounter = 0;
  });
  test.only('should create worker and post a message to worker', async () => {
    await javaAnalyzer!.writeProcessedProject();
    expect(dataContextCallCounter).toBe(1);
    expect(workerPostMessageCallCounter).toBe(1);
  });
  test.only('should handle if no unprocessed project available', async () => {
    const dataContextMockNoProject = {
      getUnprocessedProject: function() {
        throw new DataContextError('no unprocessed project available');
      },
    };
    javaAnalyzer = new JavaAnalyzerTest(stateMock, dataContextMockNoProject);
    await javaAnalyzer!.writeProcessedProject();
    expect(stateMock.result).toBe(CommonStateStatus.error);
  });
  test.only('should set result in DataContext', async () => {
    const metricsClass1 = new Metrics('public class Hotel {}', 15, 3, 1, ['public'], '', false);
    const expected = new JavaClass('Hotel', metricsClass1);
    await javaAnalyzer!.writeProcessedProject();
    worker.onmessage({
      'data': {
        'class': {
          'name': 'Hotel',
          'metrics': {
            'sourceCode': 'public class Hotel {}',
            'lineCount': 15,
            'methodCount': 3,
            'fieldCount': 1,
            'modifiers': ['public'],
            'path': '',
            'containsMainMethod': false,
          },
        },
      },
    });
    expect(dataContextMock.result).toEqual(expected);
  });
  test.only('should not set result in DataContext if state cancelled', async () => {
    stateMock.isCancelled = () => true;
    await javaAnalyzer!.writeProcessedProject();
    worker.onmessage({'data': {'class': {'metrics': {}}}});
    expect(dataContextMock.result).toBeUndefined();
  });
  test.only('should handle worker error', async () => {
    await javaAnalyzer!.writeProcessedProject();
    worker.onmessage({'data': {'error': true}});
    await expect(stateMock.result).toBe(CommonStateStatus.error);
  });
});
