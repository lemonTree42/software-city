import {ProjectData, ProjectDataChangedObserver} from '../../dataLayer/model/projectData/projectData';
import {AppConfig} from '../../dataLayer/model/configuration/internal';
import {GithubInformation} from '../../dataLayer/model/projectData/githubInformation';
import {UnprocessedComponent} from '../../dataLayer/model/projectData/unprocessed/internal';
import {ProcessedComponent} from '../../dataLayer/model/projectData/processed/internal';
import {CityComponent} from '../../dataLayer/model/projectData/layout/internal';
import {LayoutingStrategy} from '../../businessLogic/cityLayoutBuilder/strategies/strategies';

export class DataContext {
  private configuration: AppConfig;
  private projectData: ProjectData;

  constructor() {
    this.configuration = this.createAppConfig();
    this.projectData = this.createProjectData();
  }

  public getGithubInformation(): GithubInformation | null {
    return this.projectData.getGithubInformation();
  }

  public setGithubInformation(username: string, repository: string): void {
    const githubInfo = new GithubInformation(username, repository);
    this.projectData.setGithubInformation(githubInfo);
  }

  public getConfig(): AppConfig {
    return this.configuration;
  }

  public getUnprocessedProject(): UnprocessedComponent {
    return this.projectData.getUnprocessed();
  }

  public setUnprocessedProject(data: UnprocessedComponent): void {
    this.projectData.setUnprocessed(data);
  }

  public getProcessedProject(): ProcessedComponent {
    return this.projectData.getProcessed();
  }

  public setProcessedProject(data: ProcessedComponent): void {
    this.projectData.setProcessed(data);
  }

  public getLayoutBuildingStrategy(): LayoutingStrategy {
    return this.configuration.layoutingSpecification.strategy;
  }

  public getCityLayout(): CityComponent {
    return this.projectData.getCityLayout();
  }

  public setCityLayout(data: CityComponent): void {
    this.projectData.setCityLayout(data);
  }

  protected createProjectData() {
    return new ProjectData();
  }

  protected createAppConfig() {
    return new AppConfig();
  }

  public subscribeToProjectDataChanged(observer: ProjectDataChangedObserver): void {
    this.projectData.subscribeToProjectDataChanged(observer);
  }
}
