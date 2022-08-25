import {CityComponent} from '../../dataLayer/model/projectData/layout/internal';
import {DataContext} from '../../presentation/application/dataContext';
import {State} from '../../presentation/application/states/state';
import {CommonStateStatus} from '../../presentation/application/states/stateStatus';

export class CityLayoutBuilder {
  private worker?: Worker;

  constructor(
    private stateContext: State,
    private dataContext: DataContext) {
  }

  public async build(): Promise<void> {
    try {
      this.worker = await this.createLayoutBuildingWorker();
      this.worker.onmessage = (e: MessageEvent) => this.onWorkerFinished(e);
      this.worker.onerror = (e: ErrorEvent) => this.onWorkerError(e);
      const processedData = this.dataContext.getProcessedProject();
      this.worker.postMessage({strategy: this.dataContext.getLayoutBuildingStrategy(), processedData: processedData.toDTO()});
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
    this.worker?.terminate();
    const processed = CityComponent.fromDTO(event.data);
    this.dataContext.setCityLayout(processed);
    this.stateContext.finish(CommonStateStatus.success);
  }

  private onWorkerError(event: ErrorEvent): void {
    this.worker?.terminate();
    this.stateContext.finish(CommonStateStatus.error);
  }

  private async createLayoutBuildingWorker(): Promise<Worker> {
    const module = await import('../../utils/webWorkerFactory');
    return module.WebWorkerFactory.createLayoutBuildingWorker();
  }
}
