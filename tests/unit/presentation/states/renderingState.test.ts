import {IdleState} from '../../../../src/presentation/application/states/idleState';
import {CommonStateStatus} from '../../../../src/presentation/application/states/stateStatus';
import {RenderingState} from '../../../../src/presentation/application/states/renderingState';
import {DisplayingState} from '../../../../src/presentation/application/states/displayingState';
import {CityRenderer} from '../../../../src/presentation/worldVisualizer/city/cityRenderer';
jest.mock('../../../../src/presentation/worldVisualizer/city/cityRenderer');

describe('RenderingState Test Suite', function() {
  let renderingState: RenderingState | null = null;
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
  };
  const dataContextMock = {
  };
  beforeEach(() => {
    // @ts-ignore
    renderingState = new RenderingState(appMock, dataContextMock);
    callCounter = 0;
  });
  test.only('should invoke CityLayoutBuilder on start', async () => {
    await renderingState!.start();
    expect(CityRenderer).toHaveBeenCalled();
  });
  test.only('should change to next state on successful finish', async () => {
    await renderingState!.start();
    expect(appMock.currentState).toBe(RenderingState.name);
    renderingState!.finish(CommonStateStatus.success);
    expect(appMock.currentState).toBe(DisplayingState.name);
  });
  test.only('should switch to idleState on error', async () => {
    await renderingState!.start();
    expect(appMock.currentState).toBe(RenderingState.name);
    renderingState!.finish(CommonStateStatus.error);
    expect(appMock.currentState).toBe(IdleState.name);
  });
  test.only('should switch to idleState on cancel', async () => {
    await renderingState!.start();
    expect(appMock.currentState).toBe(RenderingState.name);
    renderingState!.finish(CommonStateStatus.error);
    expect(appMock.currentState).toBe(IdleState.name);
  });
});
