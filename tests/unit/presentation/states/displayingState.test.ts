import {IdleState} from '../../../../src/presentation/application/states/idleState';
import {CommonStateStatus} from '../../../../src/presentation/application/states/stateStatus';
import {DisplayingState} from '../../../../src/presentation/application/states/displayingState';

describe('DisplayingState Test Suite', function() {
  let renderingState: DisplayingState | null = null;
  const appMock = {
    currentState: '',
    updateState: function(state) {
      this.currentState = state.constructor.name;
    },
    getHtmlController: () => ({
      resetHtml: () => ({}),
      onCalculationFinished: () => ({}),
    }),
    getBabylonJsController: () => {},
    subscribeToBabylonJsLoaded: () => {},
  };
  const dataContextMock = {
  };
  beforeEach(() => {
    // @ts-ignore
    renderingState = new DisplayingState(appMock, dataContextMock);
  });
  test('should stay in state if successful finish is called', () => {
    renderingState!.start();
    expect(appMock.currentState).toBe(DisplayingState.name);
    renderingState!.finish(CommonStateStatus.success);
    expect(appMock.currentState).toBe(DisplayingState.name);
  });
  test('should switch to idleState on error', () => {
    renderingState!.start();
    expect(appMock.currentState).toBe(DisplayingState.name);
    renderingState!.finish(CommonStateStatus.error);
    expect(appMock.currentState).toBe(IdleState.name);
  });
  test('should switch to idleState on cancel', () => {
    renderingState!.start();
    expect(appMock.currentState).toBe(DisplayingState.name);
    renderingState!.finish(CommonStateStatus.error);
    expect(appMock.currentState).toBe(IdleState.name);
  });
});
