import {App} from '../app';
import {DataContext} from '../dataContext';
import {CommonStateStatus, LayoutBuildingStateStatus, State, IdleState, RenderingState} from './internal';
import {CityLayoutBuilder} from '../../../businessLogic/cityLayoutBuilder/cityLayoutBuilder';

export class LayoutBuildingState extends State {
  protected progressDisplayingName: string = 'Generating city layout';
  protected progressIndex: number = 3;

  constructor(context: App, dataContext: DataContext) {
    super(context, dataContext);
  }

  public async start(): Promise<void> {
    super.start();
    const builder = this.createCityLayoutBuilder();
    await builder.build();
  }

  public finish(status: CommonStateStatus | LayoutBuildingStateStatus): void {
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

  protected nextState(next: State = this.createNextState()): void {
    if (!this.cancelled) {
      this.dataContext.getConfig().isFirstTimeRendering = true;
      next.start();
    }
  }

  public createCityLayoutBuilder(): CityLayoutBuilder {
    return new CityLayoutBuilder(this, this.dataContext);
  }

  public createNextState() {
    return new RenderingState(this.context, this.dataContext);
  }
}
