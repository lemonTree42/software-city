import {IdleState} from '../../../../src/presentation/application/states/idleState';

describe('IdleState Test Suite', function() {
  let idleState: IdleState | null = null;
  let callCounter: number;
  const appMock = {
    currentState: '',
    updateState: function(state) {
      this.currentState = state.constructor.name;
    },
    getHtmlController: () => ({
      resetHtml: () => callCounter++,
    }),
    getBabylonJsController: () => {},
    subscribeToBabylonJsLoaded: () => {},
    lazyLoadBabylonJs: () => {},
  };
  const dataContextMock = {
  };
  beforeEach(() => {
    // @ts-ignore
    idleState = new IdleState(appMock, dataContextMock);
    callCounter = 0;
  });
  test('should reset HTML on start', () => {
    idleState!.start();
    expect(callCounter).toBe(1);
  });
});
