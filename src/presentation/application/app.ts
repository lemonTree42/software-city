import {DataContext} from './dataContext';
import {State, IdleState} from './states/internal';
import {HtmlController} from '../controller/internal';
import {StateChangeObserver, BabylonJsLoadedObserver} from './appObserver';

export class App {
  private currentState: State;
  private readonly dataContext: DataContext;
  private readonly htmlController: HtmlController;
  private babylonjsController?: any; // type needs to be any because of lazy loading
  private stateChangeObservers: StateChangeObserver[] = [];
  private babylonJsLoadedObservers: BabylonJsLoadedObserver[] = [];
  private babylonJsLoadingStarted: boolean = false;

  constructor() {
    this.dataContext = this.createDataContext();
    this.htmlController = this.createHtmlController();
    this.currentState = new IdleState(this, this.dataContext);
  }

  public run(): void {
    this.currentState.start();
  }

  public updateState(newState: State): void {
    console.log(`App changes state to %c${newState.constructor.name}`, 'color: #001dff');
    this.currentState = newState;
    this.notifyStateChangeObservers();
  }

  public getCurrentState(): State {
    return this.currentState;
  }

  public subscribeToStateChange(observer: StateChangeObserver): void {
    this.stateChangeObservers.push(observer);
  }

  private notifyStateChangeObservers(): void {
    for (const observer of this.stateChangeObservers) {
      observer.updateState(this.currentState.getProgressDisplayingName(), this.currentState.getProgressIndex());
    }
  }

  public subscribeToBabylonJsLoaded(observer: BabylonJsLoadedObserver): void {
    this.babylonJsLoadedObservers.push(observer);
  }

  private notifyBabylonJsLoadedObservers(): void {
    for (const observer of this.babylonJsLoadedObservers) {
      observer.updateBabylonJs();
    }
  }

  public lazyLoadBabylonJs(): void {
    if (this.babylonJsLoadingStarted) {
      return;
    }
    import('../controller/internal.lazy').then((module) => {
      this.babylonjsController = new module.BabylonJsController(this);
      this.notifyBabylonJsLoadedObservers();
    });
    this.babylonJsLoadingStarted = true;
  }

  // needs to return any because of lazy loading
  public getBabylonJsController(): any {
    return this.babylonjsController;
  }

  public getHtmlController(): HtmlController {
    return this.htmlController;
  }

  protected createHtmlController(): HtmlController {
    return new HtmlController(this, this.dataContext);
  }

  public getDataContext(): DataContext {
    return this.dataContext;
  }

  protected createDataContext(): DataContext {
    return new DataContext();
  }
}
