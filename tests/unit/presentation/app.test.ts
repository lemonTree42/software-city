import {App} from '../../../src/presentation/application/app';
import {IdleState} from '../../../src/presentation/application/states/idleState';
import {DataRetrievalState} from '../../../src/presentation/application/states/dataRetrievalState';

class AppTest extends App {
  // @ts-ignore
  protected createHtmlController() {
    return {
      resetHtml: () => {},
    };
  }

  // @ts-ignore
  protected createDataContext() {
    return {

    };
  }
}

describe('App Test Suite', function() {
  let app: AppTest | null = null;
  beforeEach(() => {
    app = new AppTest();
  });
  test('should be in idleState after construction', () => {
    app!.run();
    expect(app!.getCurrentState() instanceof IdleState).toBe(true);
  });
  test('updateState should update State', () => {
    app!.run();
    // @ts-ignore
    app.updateState(new DataRetrievalState(app!, app!.dataContext));
    expect(app!.getCurrentState() instanceof DataRetrievalState).toBe(true);
  });
  test('should not have babylonjsController on construction because of lazy loading', () => {
    expect(app!.getBabylonJsController()).toBeUndefined();
  });
  test('should be subscribable to state change', () => {
    let callCounter = 0;
    const observer = {
      updateState: () => callCounter++,
    };
    app!.subscribeToStateChange(observer);
    // @ts-ignore
    app!.notifyStateChangeObservers();
    expect(callCounter).toBe(1);
  });
  test('should be subscribable to babylonjs loaded', () => {
    let callCounter = 0;
    const observer = {
      updateBabylonJs: () => callCounter++,
    };
    app!.subscribeToBabylonJsLoaded(observer);
    // @ts-ignore
    app!.notifyBabylonJsLoadedObservers();
    expect(callCounter).toBe(1);
  });
});
