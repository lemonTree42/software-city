import {ProcessedComponent} from '../../../../../src/dataLayer/model/projectData/processed/internal';
import {ProcessedComponentDTOMock} from '../../mocks/ProcessedComponentDTO';
import {CityLayoutTreemapStrategy} from '../../../../../src/businessLogic/cityLayoutBuilder/strategies/cityLayoutTreemapStrategy';
import {CityComponentDTOMock} from '../../mocks/CityComponentDTO';

describe('CityLayoutSquarifiedTreemapStrategy Test Suite:', () => {
  let strategy: CityLayoutTreemapStrategy | null = null;
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
    strategy = new CityLayoutTreemapStrategy();
    dataContextMock.result = undefined;
    stateMock.result = undefined;
    dataContextCallCounter = 0;
  });
  test.only('should return CityComponent: ', () => {
    const layout = strategy!.build(ProcessedComponent.fromDTO(ProcessedComponentDTOMock));
    expect(CityComponentDTOMock).toEqual(layout.toDTO());
  });
});
