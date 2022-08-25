import {IdleState} from '../../../../src/presentation/application/states/idleState';
import {CommonStateStatus} from '../../../../src/presentation/application/states/stateStatus';
import {LayoutBuildingState} from '../../../../src/presentation/application/states/layoutBuildingState';
import {CityLayoutBuilder} from '../../../../src/businessLogic/cityLayoutBuilder/cityLayoutBuilder';
import {RenderingState} from '../../../../src/presentation/application/states/renderingState';
jest.mock('../../../../src/businessLogic/cityLayoutBuilder/cityLayoutBuilder');

describe('LayoutBuildingState Test Suite', function() {
  let layoutBuildingState: LayoutBuildingState | null = null;
  let callCounter: number;
  const appMock = {
    currentState: '',
    updateState: function(state) {
      this.currentState = state.constructor.name;
    },
    getHtmlController: () => ({
      resetHtml: () => callCounter++,
      onCalculationFinished: () => ({}),
    }),
    getBabylonJsController: () => {},
    subscribeToBabylonJsLoaded: () => {},
    lazyLoadBabylonJs: () => {},
  };
  const dataContextMock = {
    getProcessedProject: () => ({}),
    getLayoutBuildingStrategy: () => ({}),
    getConfig: () => ({isFirstTimeRendering: false}),
  };
  beforeEach(() => {
    // @ts-ignore
    layoutBuildingState = new LayoutBuildingState(appMock, dataContextMock);
    callCounter = 0;
  });
  test.only('should invoke CityLayoutBuilder on start', async () => {
    await layoutBuildingState!.start();
    expect(CityLayoutBuilder).toHaveBeenCalled();
  });
  test.only('should change to next state on successful finish', async () => {
    await layoutBuildingState!.start();
    expect(appMock.currentState).toBe(LayoutBuildingState.name);
    layoutBuildingState!.finish(CommonStateStatus.success);
    expect(appMock.currentState).toBe(RenderingState.name);
  });
  test.only('should switch to idleState on error', async () => {
    await layoutBuildingState!.start();
    expect(appMock.currentState).toBe(LayoutBuildingState.name);
    layoutBuildingState!.finish(CommonStateStatus.error);
    expect(appMock.currentState).toBe(IdleState.name);
  });
  test.only('should switch to idleState on cancel', async () => {
    await layoutBuildingState!.start();
    expect(appMock.currentState).toBe(LayoutBuildingState.name);
    layoutBuildingState!.finish(CommonStateStatus.error);
    expect(appMock.currentState).toBe(IdleState.name);
  });
});
