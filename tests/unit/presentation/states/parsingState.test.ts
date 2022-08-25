import {IdleState} from '../../../../src/presentation/application/states/idleState';
import {CommonStateStatus} from '../../../../src/presentation/application/states/stateStatus';
import {ParsingState} from '../../../../src/presentation/application/states/parsingState';
import {JavaAnalyzer} from '../../../../src/businessLogic/codeAnalyzer/javaAnalyzer';
import {LayoutBuildingState} from '../../../../src/presentation/application/states/layoutBuildingState';
jest.mock('../../../../src/businessLogic/codeAnalyzer/javaAnalyzer');

describe('ParsingState Test Suite', function() {
  let parsingState: ParsingState | null = null;
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
  };
  const dataContextMock = {
    getConfig: () => ({}),
    getProcessedProject: () => ({}),
    getLayoutBuildingStrategy: () => ({}),
  };
  beforeEach(() => {
    // @ts-ignore
    parsingState = new ParsingState(appMock, dataContextMock);
    callCounter = 0;
  });
  test.only('should invoke JavaAnalyzer on start', async () => {
    await parsingState!.start();
    expect(JavaAnalyzer).toHaveBeenCalled();
  });
  test.only('should change to next state on successful finish', async () => {
    await parsingState!.start();
    expect(appMock.currentState).toBe(ParsingState.name);
    parsingState!.finish(CommonStateStatus.success);
    expect(appMock.currentState).toBe(LayoutBuildingState.name);
  });
  test.only('should switch to idleState on error', async () => {
    await parsingState!.start();
    expect(appMock.currentState).toBe(ParsingState.name);
    parsingState!.finish(CommonStateStatus.error);
    expect(appMock.currentState).toBe(IdleState.name);
  });
  test.only('should switch to idleState on cancel', async () => {
    await parsingState!.start();
    expect(appMock.currentState).toBe(ParsingState.name);
    parsingState!.finish(CommonStateStatus.error);
    expect(appMock.currentState).toBe(IdleState.name);
  });
});
