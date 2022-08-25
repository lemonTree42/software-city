// @ts-nocheck
import {DataContextError} from '../../../../src/utils/errorhandling/Errors';
import {CommonStateStatus} from '../../../../src/presentation/application/states/stateStatus';
import {CityLayoutBuilder} from '../../../../src/businessLogic/cityLayoutBuilder/cityLayoutBuilder';
import {LayoutingStrategy} from '../../../../src/businessLogic/cityLayoutBuilder/strategies/strategies';
import {ProcessedComponentDTOMock} from '../mocks/ProcessedComponentDTO';
import {CityComponentDTOMock} from '../mocks/CityComponentDTO';
import {CityComponent} from '../../../../src/dataLayer/model/projectData/layout/internal';

let workerPostMessageCallCounter = 0;

const worker = {
  postMessage: (arg) => {
    workerPostMessageCallCounter++;
    return {data: CityComponentDTOMock};
  },
  terminate: () => ({}),
};

class CityLayoutBuilderTest extends CityLayoutBuilder {
  public async createLayoutBuildingWorker(): Promise<Worker> {
    return new Promise((res) => {
      res(worker);
    });
  }
}

describe('CityLayoutBuilder Test Suite:', () => {
  let cityLayoutBuilder: CityLayoutBuilderTest | null = null;
  let dataContextCallCounter: any;
  let dataContextMock: any;
  let stateMock: any;
  beforeEach(() => {
    dataContextMock = {
      getProcessedProject: function() {
        dataContextCallCounter++;
        return {toDTO: () => ({})};
      },
      setCityLayout: function(data) {
        this.result = data;
      },
      getLayoutBuildingStrategy: function() {
        return LayoutingStrategy.simpleTreemap;
      },
    };
    stateMock = {
      finish: function(status) {
        this.result = status;
      },
      isCancelled: () => false,
    };
    cityLayoutBuilder = new CityLayoutBuilderTest(stateMock, dataContextMock);
    dataContextMock.result = undefined;
    stateMock.result = undefined;
    dataContextCallCounter = 0;
    workerPostMessageCallCounter = 0;
  });
  test.only('should create worker and post a message to worker', async () => {
    await cityLayoutBuilder!.build();
    expect(dataContextCallCounter).toBe(1);
    expect(workerPostMessageCallCounter).toBe(1);
  });
  test.only('should handle if no processed project available', async () => {
    const dataContextMockNoProject = {
      getUnprocessedProject: function() {
        throw new DataContextError('no processed project available');
      },
    };
    cityLayoutBuilder = new CityLayoutBuilderTest(stateMock, dataContextMockNoProject);
    await cityLayoutBuilder!.build();
    expect(stateMock.result).toBe(CommonStateStatus.error);
  });
  test.only('should set result in DataContext', async () => {
    await cityLayoutBuilder!.build();
    worker.onmessage({data: CityComponentDTOMock});
    expect(dataContextMock.result).toEqual(CityComponent.fromDTO(CityComponentDTOMock));
  });
  test.only('should not set result in DataContext if state cancelled', async () => {
    stateMock.isCancelled = () => true;
    await cityLayoutBuilder!.build();
    worker.onmessage({'data': {'class': ProcessedComponentDTOMock}});
    expect(dataContextMock.result).toBeUndefined();
  });
  test.only('should handle worker error', async () => {
    await cityLayoutBuilder!.build();
    worker.onmessage({'data': {'error': true}});
    await expect(stateMock.result).toBe(CommonStateStatus.error);
  });
});
