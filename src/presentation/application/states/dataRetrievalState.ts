import {ProjectDataProxy} from '../../../dataLayer/githubProxy/projectDataProxy';
import {App} from '../app';
import {DataContext} from '../dataContext';
import {State, ParsingState, IdleState, CommonStateStatus, DataRetrievalStateStatus} from './internal';

export class DataRetrievalState extends State {
  protected progressDisplayingName: string = 'Fetching data from GitHub';
  protected progressIndex: number = 1;

  constructor(
      context: App,
      dataContext: DataContext,
  ) {
    super(context, dataContext);
  }

  public async start(): Promise<void> {
    super.start();
    if (this.dataContext.getConfig().isDemoMode) {
      this.finish(DataRetrievalStateStatus.usingDTO);
    } else {
      const dataResource = this.createProjectDataProxy();
      await dataResource.writeData();
    }
  }

  public finish(status: CommonStateStatus | DataRetrievalStateStatus, error?: Error): void {
    if (this.cancelled) {
      return;
    }
    switch (status) {
      case CommonStateStatus.success:
        this.nextState();
        break;
      case CommonStateStatus.error:
        // go back to idle state or later back to the city
        this.nextState(new IdleState(this.context, this.dataContext, error));
        break;
      case CommonStateStatus.cancel:
        this.nextState(new IdleState(this.context, this.dataContext));
        this.cancelled = true;
        break;
      case DataRetrievalStateStatus.usingDTO:
        this.nextState(new ParsingState(this.context, this.dataContext));
        break;
    }
  }

  protected nextState(next: State = this.createNextState()): void {
    next.start();
  }

  private updateControllers(files: number, lines: number): void {
    const htmlController = this.getAppContext().getHtmlController();
    const babylonjsController = this.getAppContext().getBabylonJsController();
    htmlController.updateDataRetrievalStatus(files, lines);
    babylonjsController && babylonjsController.updateDataRetrievalStatus(files, lines);
  }

  public createProjectDataProxy(): ProjectDataProxy {
    return new ProjectDataProxy(this, this.dataContext, (files, lines) => this.updateControllers(files, lines));
  }

  public createNextState(): ParsingState {
    return new ParsingState(this.context, this.dataContext);
  }
}
