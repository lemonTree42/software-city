import {App} from '../app';
import {DataContext} from '../dataContext';
import {State, IdleState, CommonStateStatus, ParsingStateStatus, LayoutBuildingState} from './internal';
import {JavaAnalyzer} from '../../../businessLogic/codeAnalyzer/javaAnalyzer';
import {UnprocessedComponent} from '../../../dataLayer/model/projectData/unprocessed/unprocessedComponent';
import * as demo from '../../../dataLayer/model/configuration/demoProjectDTO';

export class ParsingState extends State {
  protected progressDisplayingName: string = 'Analyzing project';
  protected progressIndex: number = 2;

  constructor(context: App, dataContext: DataContext) {
    super(context, dataContext);
  }

  public async start(): Promise<void> {
    super.start();
    if (this.dataContext.getConfig().isDemoMode) {
      this.dataContext.getConfig().renderSpecification.enhancedCity = true;
      this.dataContext.setGithubInformation(demo.username, demo.repository);
      this.dataContext.setUnprocessedProject(UnprocessedComponent.fromDTO(demo.unprocessedDemoProject));
    }
    console.log(JSON.stringify(this.dataContext.getUnprocessedProject().toDTO()));
    const analyzer = this.createJavaAnalyzer();
    await analyzer.writeProcessedProject();
  }

  public finish(status: CommonStateStatus | ParsingStateStatus): void {
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
      next.start();
    }
  }

  private onFileParseError(name: string): void {
    const htmlController = this.getAppContext().getHtmlController();
    htmlController.onParsingStateError(name);
  }

  public createJavaAnalyzer(): JavaAnalyzer {
    return new JavaAnalyzer(this, this.dataContext, (name) => this.onFileParseError(name));
  }

  public createNextState(): LayoutBuildingState {
    return new LayoutBuildingState(this.context, this.dataContext);
  }
}
