import {DataContext} from '../../presentation/application/dataContext';
import {UnprocessedComponent, UnprocessedDirectory} from '../model/projectData/unprocessed/internal';
import {State} from '../../presentation/application/states/state';
import {DataContextError, GithubApiError} from '../../utils/errorhandling/Errors';
import {CommonStateStatus} from '../../presentation/application/states/stateStatus';

export class ProjectDataProxy {
  private worker?: Worker;

  constructor(
    private stateContext: State,
    private dataContext: DataContext,
    private updateGuiCallback: Function,
  ) {
  }

  public async writeData(): Promise<void> {
    try {
      this.worker = await this.createJavaFileCollectorWorker();
      this.worker.onmessage = (e: MessageEvent) => this.onWorkerUpdate(e);
      this.worker.onerror = (e: ErrorEvent) => this.onWorkerError(e);
      const {username, repository} = this.getGithubInformation();
      this.worker.postMessage({username, repository});
    } catch (e) {
      this.stateContext.finish(CommonStateStatus.error);
    }
  }

  private onWorkerUpdate(event: MessageEvent): void {
    if (this.stateContext.isCancelled()) {
      return;
    }
    if (event.data.error) {
      this.stateContext.finish(CommonStateStatus.error, new GithubApiError(event.data.error));
      return;
    }
    if (event.data.statusUpdate) {
      this.updateGuiCallback(event.data.statusUpdate.filesRead, event.data.statusUpdate.linesRead);
      return;
    }
    this.worker?.terminate();
    const result = UnprocessedComponent.fromDTO(event.data);
    if ((<UnprocessedDirectory>result).getContent().length === 0) {
      this.stateContext.finish(CommonStateStatus.error, new GithubApiError('We were unable to find any Java files in this repository.'));
    } else {
      this.dataContext.setUnprocessedProject(result);
      this.stateContext.finish(CommonStateStatus.success);
    }
  }

  private onWorkerError(event: ErrorEvent): void {
    this.worker?.terminate();
    this.stateContext.finish(CommonStateStatus.error);
  }

  private getGithubInformation() {
    const githubInformation = this.dataContext.getGithubInformation();
    if (!githubInformation) {
      throw new DataContextError('No Github Information available');
    }
    const username = githubInformation.getUsername();
    const repository = githubInformation.getRepository();
    return {username, repository};
  }

  private async createJavaFileCollectorWorker(): Promise<Worker> {
    // WebWorkerFactory needs to be lazy loaded because jest can't handle import.meta.url
    const module = await import('../../utils/webWorkerFactory');
    return module.WebWorkerFactory.createJavaFileCollectorWorker();
  }
}
