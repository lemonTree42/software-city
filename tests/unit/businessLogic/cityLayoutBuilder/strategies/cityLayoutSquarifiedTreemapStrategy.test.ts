import {ProcessedComponent} from '../../../../../src/dataLayer/model/projectData/processed/internal';
import {ProcessedComponentDTOMock} from '../../mocks/ProcessedComponentDTO';
import {CityLayoutSquarifiedTreemapStrategy} from '../../../../../src/businessLogic/cityLayoutBuilder/strategies/cityLayoutSquarifiedTreemapStrategy';
import {CityComponentDTOMock} from '../../mocks/SquarifiedCityComponentDTO';

class CityLayoutSquarifiedTreemapStrategyTest extends CityLayoutSquarifiedTreemapStrategy {
  protected getRandomDepth(depth: number): number {
    return 0.01;
  }
}

describe('CityLayoutSquarifiedTreemapStrategy Test Suite:', () => {
  let strategy: CityLayoutSquarifiedTreemapStrategyTest | null = null;
  // eslint-disable-next-line
  let dataContextCallCounter: any;
  let dataContextMock: any;
  let stateMock: any;
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
    strategy = new CityLayoutSquarifiedTreemapStrategyTest();
    dataContextMock.result = undefined;
    stateMock.result = undefined;
    dataContextCallCounter = 0;
  });
  test.only('should return CityComponent: ', () => {
    const layout = strategy!.build(ProcessedComponent.fromDTO(ProcessedComponentDTOMock));
    expect(layout.toDTO()).toEqual(CityComponentDTOMock);
  });
});
