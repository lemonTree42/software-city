import {App} from '../app';
import {DataContext} from '../dataContext';
import {StateStatus} from './stateStatus';

export abstract class State {
  protected abstract progressDisplayingName: string;
  protected abstract progressIndex: number;
  protected cancelled: boolean = false;

  constructor(
    protected context: App,
    protected dataContext: DataContext) {
  }

  public start(): void {
    this.context.updateState(this);
  }

  public abstract finish(status: StateStatus, error?: Error): void;

  protected abstract nextState(next?: State): void;

  public isCancelled(): boolean {
    return this.cancelled;
  }

  public getAppContext(): App {
    return this.context;
  }

  public getProgressDisplayingName(): string {
    return this.progressDisplayingName;
  }

  public getProgressIndex(): number {
    return this.progressIndex;
  }
}
