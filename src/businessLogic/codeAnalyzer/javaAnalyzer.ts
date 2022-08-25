import {State} from '../../presentation/application/states/state';
import {DataContext} from '../../presentation/application/dataContext';
import {CommonStateStatus} from '../../presentation/application/states/stateStatus';
import {ProcessedComponent} from '../../dataLayer/model/projectData/processed/internal';

export class JavaAnalyzer {
  private worker?: Worker;

  constructor(
    private stateContext: State,
    private dataContext: DataContext,
    private onFileParseErrorCallback: Function) {
  }

  public async writeProcessedProject(): Promise<void> {
    try {
      this.worker = await this.createJavaAnalyzerWorker();
      this.worker.onmessage = (e: MessageEvent) => this.onWorkerFinished(e);
      this.worker.onerror = (e: ErrorEvent) => this.onWorkerError(e);
      const unprocessedData = this.dataContext.getUnprocessedProject();
      this.worker.postMessage(unprocessedData.toDTO());
    } catch (e) {
      this.stateContext.finish(CommonStateStatus.error);
    }
  }

  private onWorkerFinished(event: MessageEvent): void {
    if (this.stateContext.isCancelled()) {
      return;
    }
    if (event.data.error) {
      this.stateContext.finish(CommonStateStatus.error);
      return;
    }
    if (event.data.fileParseError) {
      this.onFileParseErrorCallback(event.data.fileParseError.name);
      return;
    }
    this.worker?.terminate();
    const processed = ProcessedComponent.fromDTO(event.data);
    this.dataContext.setProcessedProject(processed);
    this.stateContext.finish(CommonStateStatus.success);
  }

  private onWorkerError(event: ErrorEvent): void {
    this.worker?.terminate();
    this.stateContext.finish(CommonStateStatus.error);
  }

  private async createJavaAnalyzerWorker(): Promise<Worker> {
    const module = await import('../../utils/webWorkerFactory');
    return module.WebWorkerFactory.createJavaAnalyzerWorker();
  }
}
