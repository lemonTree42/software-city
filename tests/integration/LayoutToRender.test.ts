// @ts-nocheck
import {CommonStateStatus} from '../../src/presentation/application/states/stateStatus';
import {DataContext} from '../../src/presentation/application/dataContext';
import {LayoutBuildingState} from '../../src/presentation/application/states/layoutBuildingState';
import {CityLayoutBuilder} from '../../src/businessLogic/cityLayoutBuilder/cityLayoutBuilder';
import {CityComponent} from '../../src/dataLayer/model/projectData/layout/cityComponent';
import {RenderingState} from '../../src/presentation/application/states/renderingState';

const layoutMock = {
  quarter: {
    position: {
      x: 0,
      y: 0,
    },
    dimension: {
      width: 1,
      height: 1,
    },
    depth: 1,
    hidden: false,
    name: 'test',
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
  public createCityLayoutBuilder(): CityLayoutBuilder {
    return new CityLayoutBuilderTest(this, this.dataContext);
  }
  public createNextState(): LayoutBuildingState {
    return renderingStateTest;
  }
}

class CityLayoutBuilderTest extends CityLayoutBuilder {
  public async build(): Promise<void> {
    this.dataContext.setCityLayout(CityComponent.fromDTO(layoutMock));
  }
}

class RenderingStateTest extends RenderingState {
  public async start(): Promise<void> {
    this.layout = this.dataContext.getCityLayout();
  }
}

const renderingStateTest = new RenderingStateTest(appMock, dataContext);

describe('Integration Test Suite LayoutBuildingState and RenderingState', function() {
  test.only('LayoutBuildingState should write Layout - RenderingState should read previously written Layout', async () => {
    dataContext.setGithubInformation('fred', 'freds-repo');
    const state = new LayoutBuildingStateTest(appMock, dataContext);
    await state.start();
    state.finish(CommonStateStatus.success);
    await renderingStateTest.start();
    expect(renderingStateTest.layout.toDTO()).toEqual(layoutMock);
  });
});
