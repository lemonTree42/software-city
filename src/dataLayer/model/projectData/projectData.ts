import {UnprocessedComponent} from './unprocessed/internal';
import {ProcessedComponent} from './processed/internal';
import {CityComponent} from './layout/internal';
import {GithubInformation} from './githubInformation';
import {DataContextError, InvalidCallError} from '../../../utils/errorhandling/Errors';

export interface ProjectDataChangedObserver {
  projectDataUpdated(): void;
}

export class ProjectData {
  private latestData: [string, string, string] = ['', '', ''];
  private githubInformation: GithubInformation | null = null;
  private unprocessed: UnprocessedComponent | null = null;
  private processed: ProcessedComponent | null = null;
  private cityLayout: CityComponent | null = null;
  private projectDataSubscribers: ProjectDataChangedObserver[] = [];

  public setGithubInformation(data: GithubInformation): void {
    this.githubInformation = data;
  }

  public getGithubInformation(): GithubInformation | null {
    return this.githubInformation;
  }

  public setUnprocessed(data: UnprocessedComponent): void {
    this.unprocessed = data;
    this.updateLatestData(0);
    this.notifyProjectDataChangedObservers();
  }

  public getUnprocessed(): UnprocessedComponent {
    if (!this.unprocessed) {
      throw new DataContextError('no unprocessed project available');
    }
    this.ensureLatestData(0);
    return this.unprocessed;
  }

  public setProcessed(data: ProcessedComponent): void {
    this.processed = data;
    this.updateLatestData(1);
    this.notifyProjectDataChangedObservers();
  }

  public getProcessed(): ProcessedComponent {
    if (!this.processed) {
      throw new DataContextError('no processed project available');
    }
    this.ensureLatestData(1);
    return this.processed;
  }

  public setCityLayout(data: CityComponent): void {
    this.cityLayout = data;
    this.notifyProjectDataChangedObservers();
  }

  public getCityLayout(): CityComponent {
    if (!this.cityLayout) {
      throw new DataContextError('no city layout available');
    }
    return this.cityLayout;
  }

  private updateLatestData(index: number): void {
    if (!this.githubInformation) {
      throw new InvalidCallError('no GitHub information available');
    }
    this.latestData[index] = this.getGithubInformation()!.getProjectKey();
  }

  private ensureLatestData(index: number) {
    if (this.latestData[index] !== this.githubInformation?.getProjectKey()) {
      throw new DataContextError('requested project data not up to date');
    }
  }

  public subscribeToProjectDataChanged(observer: ProjectDataChangedObserver): void {
    this.projectDataSubscribers.push(observer);
  }

  private notifyProjectDataChangedObservers(): void {
    for (const observer of this.projectDataSubscribers) {
      observer.projectDataUpdated();
    }
  }
}
