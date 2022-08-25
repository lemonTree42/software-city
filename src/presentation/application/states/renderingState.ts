import {App} from '../app';
import {DataContext} from '../dataContext';
import {
  State,
  RenderingStateStatus,
  CommonStateStatus,
  IdleState,
  DisplayingState,
} from './internal';
import {CityRenderer} from '../../worldVisualizer/city/cityRenderer';

export class RenderingState extends State {
  protected progressDisplayingName: string = 'Rendering city into world';
  protected progressIndex: number = 4;

  constructor(context: App, dataContext: DataContext) {
    super(context, dataContext);
  }

  public async start(): Promise<void> {
    super.start();
    const renderer = new CityRenderer(this, this.dataContext);
    await renderer.initiateRendering();
  }

  public finish(status: CommonStateStatus | RenderingStateStatus): void {
    switch (status) {
      case CommonStateStatus.success:
        this.nextState();
        break;
      case CommonStateStatus.error:
        this.nextState(new IdleState(this.context, this.dataContext));
        break;
      case CommonStateStatus.cancel:
        this.nextState(new IdleState(this.context, this.dataContext));
        this.cancelled = true;
        break;
    }
  }

  protected nextState(next: State = new DisplayingState(this.context, this.dataContext)): void {
    if (!this.cancelled) {
      next.start();
    }
  }
}
