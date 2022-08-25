import {App} from '../app';
import {DataContext} from '../dataContext';
import {State, DataRetrievalState, CommonStateStatus, IdleStateStatus} from './internal';

export class IdleState extends State {
  protected progressDisplayingName: string = 'Waiting for user input';
  protected progressIndex: number = 0;

  constructor(
      context: App,
      dataContext: DataContext,
      private error?: Error,
  ) {
    super(context, dataContext);
  }

  public start(): void {
    super.start();
    this.context.getHtmlController().resetHtml();
    if (this.error) {
      this.context.getHtmlController().onIdleStateError(this.error.message);
    }
  }

  public finish(status: CommonStateStatus | IdleStateStatus): void {
    switch (status) {
      case CommonStateStatus.success:
        this.nextState();
        break;
      case CommonStateStatus.error:
        // remain in idleState
        break;
      case CommonStateStatus.cancel:
        // remain in idleState
        break;
    }
  }

  protected nextState(next: State = this.createNextState()): void {
    next.start();
  }

  public createNextState(): DataRetrievalState {
    return new DataRetrievalState(this.context, this.dataContext);
  }
}
