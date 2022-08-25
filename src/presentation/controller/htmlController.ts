import {DataContext} from '../application/dataContext';
import {GithubApi} from '../../dataLayer/githubProxy/githubApi';
import {App} from '../application/app';
import {IdleState} from '../application/states/idleState';
import {InvalidCallError, StateChangeError} from '../../utils/errorhandling/Errors';
import {CommonStateStatus} from '../application/states/stateStatus';
import {BabylonJsLoadedObserver, StateChangeObserver} from '../application/appObserver';
import {DisplayingState} from '../application/states/displayingState';

export class HtmlController implements StateChangeObserver, BabylonJsLoadedObserver {
  private buttonRepositoryCard!: HTMLButtonElement;
  private buttonEnterVr!: HTMLButtonElement;
  private buttonAbort!: HTMLButtonElement;
  private buttonDemo!: HTMLButtonElement;
  private inputUsername!: HTMLInputElement;
  private inputRepository!: HTMLInputElement;
  private buildCityFormErrorContainer!: HTMLElement;
  private buildCityFormErrorMessage!: HTMLElement;
  private progressingCardErrorContainer!: HTMLElement;
  private progressingCardErrorMessage!: HTMLElement;
  private analysisCardHeader!: HTMLElement;
  private analysisCard!: HTMLFormElement;
  private repositoryCard!: HTMLElement;
  private repositoryCardForm!: HTMLFormElement;
  private analysisState!: HTMLElement;
  private analysisStateDataRetrieved!: HTMLElement;
  private repositoryCardBrowserError!: HTMLElement;
  private analysisCardProgressBar!: HTMLElement;
  private analysisCardProgressBarContainer!: HTMLElement;
  private checkRepositoryHandler: any;
  private buildCityHandler: any;

  constructor(
      private appContext: App,
      private dataContext: DataContext) {
    this.appContext = appContext;
    this.dataContext = dataContext;
    this.initHtml();
    this.checkSupport().then();
  }

  private async checkSupport() {
    if (await this.checkImmersiveVrSupport() && this.checkWebWorkerSupport()) {
      this.appContext.subscribeToStateChange(this);
      this.appContext.subscribeToBabylonJsLoaded(this);
    } else {
      this.showMainErrorMessage();
    }
  }

  private async checkImmersiveVrSupport(): Promise<boolean> {
    if ('xr' in navigator) {
      const vrSupported = await (navigator as any).xr.isSessionSupported('immersive-vr');
      if (vrSupported) {
        return true;
      }
      this.repositoryCardBrowserError.innerText = 'Sorry, your browser supports WebXR, but doesn\'t have a VR mode.';
      return false;
    } else {
      this.repositoryCardBrowserError.innerText = 'Sorry, your browser does not support WebXR.';
      return false;
    }
  }

  private checkWebWorkerSupport(): boolean {
    if (typeof (Worker) === 'undefined') {
      this.repositoryCardBrowserError.innerText = 'Sorry, your browser does not support web workers.';
      return false;
    }
    return true;
  }

  private initHtml(): void {
    this.buttonDemo = <HTMLButtonElement>document.getElementById('demo-button');
    this.buttonRepositoryCard = <HTMLButtonElement>document.getElementById('button-build-city-card');
    this.buttonEnterVr = <HTMLButtonElement>document.getElementById('enter-vr-button');
    this.buttonAbort = <HTMLButtonElement>document.getElementById('abort-button');
    this.inputUsername = <HTMLInputElement>document.getElementById('input-username');
    this.inputRepository = <HTMLInputElement>document.getElementById('input-repository');
    this.buildCityFormErrorContainer = <HTMLElement>document.getElementById('build-city-form-error-message');
    this.buildCityFormErrorMessage = <HTMLElement>document.getElementById('build-city-form-error-message-content');
    this.progressingCardErrorContainer = <HTMLElement>document.getElementById('progressing-card-error-message');
    this.progressingCardErrorMessage = <HTMLElement>document.getElementById('progressing-card-error-message-content');
    this.analysisCard = <HTMLFormElement>document.getElementById('progressing-card');
    this.analysisCardHeader = <HTMLFormElement>document.getElementById('progressing-card-header');
    this.repositoryCard = <HTMLFormElement>document.getElementById('repository-card');
    this.analysisState = <HTMLElement>document.getElementById('analysis-state');
    this.analysisStateDataRetrieved = <HTMLElement>document.getElementById('analysis-state-data-retrieved');
    this.repositoryCardForm = <HTMLFormElement>document.getElementById('repository-card-form');
    this.repositoryCardBrowserError = <HTMLElement>document.getElementById('repository-card-browser-error');
    this.analysisCardProgressBar = <HTMLFormElement>document.getElementById('progressing-card-progressbar');
    this.analysisCardProgressBarContainer = <HTMLFormElement>document.getElementById('progressing-card-progress-container');
    this.checkRepositoryHandler = (e) => this.onCheckRepositoryClicked(e);
    this.buildCityHandler = (e) => this.onBuildCityClicked(e);
    this.buttonEnterVr.addEventListener('click', (e) => this.onEnterVrClicked(e));
    this.buttonAbort.addEventListener('click', (e) => this.onAbortClicked(e));
    this.buttonDemo.addEventListener('click', (e) => this.onDemoClicked(e));
    this.inputUsername.addEventListener('input', () => this.onInputChanged());
    this.inputRepository.addEventListener('input', () => this.onInputChanged());
  }

  public resetHtml(): void {
    this.buttonRepositoryCard.removeEventListener('click', this.buildCityHandler);
    this.buttonRepositoryCard.addEventListener('click', this.checkRepositoryHandler);
    this.repositoryCard.style.display = 'initial';
    this.analysisCard.style.display = 'none';
    this.buttonRepositoryCard.innerText = 'Check Repository';
    this.buttonRepositoryCard.classList.remove('positive');
    this.buttonRepositoryCard.classList.remove('loading');
    this.buildCityFormErrorContainer.hidden = true;
    this.buildCityFormErrorMessage.innerText = '';
    this.progressingCardErrorContainer.hidden = true;
    this.progressingCardErrorMessage.innerText = '';
    this.updateDataRetrievalStatus(0, 0);
  }

  private showMainErrorMessage(): void {
    this.repositoryCardForm.hidden = true;
    this.repositoryCardBrowserError.hidden = false;
  }

  public showErrorMessage(container: HTMLElement, messageElement: HTMLElement, message: string): void {
    this.buttonRepositoryCard.classList.remove('loading');
    messageElement.innerText = message;
    container.hidden = false;
  }

  private async onCheckRepositoryClicked(event): Promise<void> {
    event.preventDefault();
    this.appContext.getDataContext().getConfig().isDemoMode = false;
    this.buildCityFormErrorContainer.hidden = true;
    if (!(this.appContext.getCurrentState() instanceof IdleState)) {
      throw new StateChangeError('app needs to be in IdleState at this point');
    }
    this.buttonRepositoryCard.classList.add('loading');
    if (await this.checkIfRepoExists()) {
      this.buttonRepositoryCard.removeEventListener('click', this.checkRepositoryHandler);
      this.buttonRepositoryCard.addEventListener('click', this.buildCityHandler);
      this.buttonRepositoryCard.innerText = 'Build City';
      this.buttonRepositoryCard.classList.add('positive');
      this.buttonRepositoryCard.classList.remove('loading');
    }
  }

  private onBuildCityClicked(event): void {
    event.preventDefault();
    if (!this.appContext.getBabylonJsController()) {
      this.appContext.lazyLoadBabylonJs();
    }
    if (this.appContext.getDataContext().getConfig().isDemoMode) {
      this.dataContext.setGithubInformation('DemoUser', 'DemoRepo');
    } else {
      this.dataContext.setGithubInformation(this.inputUsername.value, this.inputRepository.value);
    }
    this.repositoryCard.style.display = 'none';
    this.analysisCard.style.display = 'initial';
    this.analysisCardHeader.innerText = 'We\'re calculating your city ...';
    this.analysisCardProgressBarContainer.classList.add('active');
    this.appContext.getCurrentState().finish(CommonStateStatus.success);
  }

  public onCalculationFinished(): void {
    if (!(this.appContext.getCurrentState() instanceof DisplayingState)) {
      throw new InvalidCallError('app needs to be in DisplayingState at this point');
    }
    this.analysisCardHeader.innerText = 'Your city is ready!';
    this.analysisCardProgressBarContainer.classList.remove('active');
    this.buttonAbort.innerText = 'Enter new Repository';
  }

  private async onEnterVrClicked(event): Promise<void> {
    event.preventDefault();
    try {
      await this.appContext.getBabylonJsController().onEnterVrClicked();
    } catch (e: any) {
      this.showErrorMessage(this.progressingCardErrorContainer, this.progressingCardErrorMessage, e.message);
    }
  }

  private onAbortClicked(event): void {
    event.preventDefault();
    this.appContext.getCurrentState().finish(CommonStateStatus.cancel);
  }

  private async onDemoClicked(event): Promise<void> {
    event.preventDefault();
    this.dataContext.getConfig().isDemoMode = true;
    this.onBuildCityClicked(event);
  }

  private onInputChanged(): void {
    this.buttonRepositoryCard.disabled = !(this.inputUsername.value !== '' && this.inputRepository.value !== '');
    this.buttonRepositoryCard.removeEventListener('click', this.buildCityHandler);
    this.buttonRepositoryCard.addEventListener('click', this.checkRepositoryHandler);
    this.buttonRepositoryCard.innerText = 'Check Repository';
    this.buttonRepositoryCard.classList.remove('positive');
  }

  private async checkIfRepoExists(): Promise<boolean> {
    const api = new GithubApi();
    try {
      await api.getLatestCommit(this.inputUsername.value, this.inputRepository.value);
      return true;
    } catch (e) {
      // @ts-ignore
      this.showErrorMessage(this.buildCityFormErrorContainer, this.buildCityFormErrorMessage, e.message);
      return false;
    }
  }

  public updateState(newState: string, newStateIndex: number): void {
    this.analysisState.innerText = this.appContext.getCurrentState().getProgressDisplayingName();
    this.analysisCardProgressBar.style.width = `${100*(newStateIndex-1)/4}%`;
  }

  public async updateBabylonJs(): Promise<void> {
    this.buttonEnterVr.classList.remove('loading');
    this.buttonEnterVr.disabled = false;
  }

  public updateDataRetrievalStatus(filesAmount: number, linesAmount: number): void {
    this.analysisStateDataRetrieved.innerText = `${filesAmount} files and ${linesAmount} lines of code read`;
  }

  public onIdleStateError(message: string): void {
    this.showErrorMessage(this.buildCityFormErrorContainer, this.buildCityFormErrorMessage, message);
  }

  public onParsingStateError(name: string): void {
    const message = `Failed to parse ${name} - Skipping it\n` + this.progressingCardErrorMessage.innerText;
    this.showErrorMessage(this.progressingCardErrorContainer, this.progressingCardErrorMessage, message);
  }
}
