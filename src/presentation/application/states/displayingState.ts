import {App} from '../app';
import {DataContext} from '../dataContext';
import {CommonStateStatus, DisplayingStateStatus, IdleState, RenderingState, State} from './internal';

export class DisplayingState extends State {
  protected progressDisplayingName: string = 'Finished';
  protected progressIndex: number = 5;

  constructor(context: App, dataContext: DataContext) {
    super(context, dataContext);
  }

  public start(): void {
    super.start();
    this.context.getHtmlController().onCalculationFinished();
  }

  public finish(status: CommonStateStatus | DisplayingStateStatus): void {
    switch (status) {
      case CommonStateStatus.success:
        break;
      case CommonStateStatus.error:
        this.nextState(new IdleState(this.context, this.dataContext));
        break;
      case CommonStateStatus.cancel:
        this.nextState(new IdleState(this.context, this.dataContext));
        this.cancelled = true;
        break;
      case DisplayingStateStatus.settingsChanged:
        this.nextState(new RenderingState(this.context, this.dataContext));
    }
  }

  protected nextState(next: State): void {
    if (!this.cancelled) {
      next.start();
    }
  }
}
