import {Button, Grid, Slider, TextBlock} from '@babylonjs/gui/2D';
import {StateChangeObserver} from '../../../application/appObserver';
import {App} from '../../../application/app';
import {BabylonJsController} from '../../../controller/babylonJsController';
import {GuiFramed} from '../guiFramed';
import {Scene} from '@babylonjs/core/scene';
import {FreeCamera} from '@babylonjs/core/Cameras/freeCamera';
import {World} from '../../internal.lazy';

export class GuiProgress extends GuiFramed implements StateChangeObserver {
  private header?: TextBlock;
  private progressingText?: TextBlock;
  private progressingTextDataFetchStatus?: TextBlock;
  private progressingSlider?: Slider;
  private exitVrButton?: Button;
  private abortButton?: Button;
  private progressingSliderAnimationOngoing: boolean = false;
  private progressingSliderAnimationTarget: number = 0;

  constructor(
      scene: Scene,
      camera: FreeCamera,
      world: World,
      protected babylonjsController: BabylonJsController,
      protected appContext: App,
  ) {
    super(scene, camera, world);
  }

  protected drawContent(layout: Grid): void {
    this.backButton.isVisible = false;

    layout.addColumnDefinition(100, true);
    layout.addColumnDefinition(1);
    layout.addColumnDefinition(100, true);
    layout.addRowDefinition(1);
    layout.addRowDefinition(0.15);
    layout.addRowDefinition(0.5);
    layout.addRowDefinition(0.4);
    layout.addRowDefinition(0.4);
    layout.addRowDefinition(0.15);
    layout.addRowDefinition(0.7);
    layout.addRowDefinition(0.7);
    layout.addRowDefinition(100, true);

    this.header = new TextBlock();
    this.header.color = '#808080';
    this.header.textWrapping = true;
    this.header.text = 'We\'re calculating your city ...';
    this.header.style = this.headerStyle;
    layout.addControl(this.header, 0, 1);

    this.progressingSlider = new Slider();
    this.progressingSlider.paddingTopInPixels = 30;
    this.progressingSlider.color = '#888';
    this.progressingSlider.background = 'rgba(0,0,0,0.1)';
    this.progressingSlider.displayThumb = false;
    this.progressingSlider.minimum = -0.1;
    this.progressingSlider.maximum = 1;
    this.progressingSlider.value = this.convertToPercentage(this.appContext.getCurrentState().getProgressIndex());
    this.progressingSlider.width = 0.8;
    layout.addControl(this.progressingSlider, 2, 1);

    this.progressingText = new TextBlock();
    this.progressingText.color = '#494949';
    this.progressingText.textWrapping = true;
    this.progressingText.text = this.appContext.getCurrentState().getProgressDisplayingName();
    this.progressingText.fontSize = 55;
    this.progressingText.fontFamily = 'Lato';
    layout.addControl(this.progressingText, 3, 1);

    this.progressingTextDataFetchStatus = new TextBlock();
    this.progressingTextDataFetchStatus.color = '#818187';
    this.progressingTextDataFetchStatus.textWrapping = true;
    this.progressingTextDataFetchStatus.text = '0 files and 0 lines of code read';
    this.progressingTextDataFetchStatus.fontSize = 47;
    this.progressingTextDataFetchStatus.fontFamily = 'Lato';
    layout.addControl(this.progressingTextDataFetchStatus, 4, 1);

    this.exitVrButton = Button.CreateSimpleButton('exitVrButton', 'Exit VR');
    this.exitVrButton.paddingTopInPixels = 30;
    this.exitVrButton.color = 'white';
    this.exitVrButton.cornerRadius = 20;
    this.exitVrButton.fontSize = 70;
    this.exitVrButton.background = '#275082';
    this.exitVrButton.style = this.textBodyStyle;
    this.exitVrButton.onPointerUpObservable.add(() => this.babylonjsController.onExitVrClicked());
    layout.addControl(this.exitVrButton, 6, 1);

    this.abortButton = Button.CreateSimpleButton('abortButton', 'Abort');
    this.abortButton.paddingTopInPixels = 30;
    this.abortButton.color = 'white';
    this.abortButton.cornerRadius = 20;
    this.abortButton.fontSize = 70;
    this.abortButton.background = '#cec8b0';
    this.abortButton.style = this.textBodyStyle;
    this.abortButton.onPointerUpObservable.add(() => this.babylonjsController.onAbortClicked());
    layout.addControl(this.abortButton, 7, 1);

    this.appContext.subscribeToStateChange(this);
  }

  public updateState(newState: string, newStateIndex: number): void {
    newStateIndex = this.convertToPercentage(newStateIndex);
    if (this.progressingText && this.progressingSlider) {
      this.progressingText.text = this.appContext.getCurrentState().getProgressDisplayingName();
      const oldTarget = this.progressingSliderAnimationTarget;
      this.progressingSliderAnimationTarget = newStateIndex;
      if (oldTarget < newStateIndex) {
        if (!this.progressingSliderAnimationOngoing) {
          this.animationLoop();
        }
      } else {
        this.progressingSlider!.value = newStateIndex;
      }
    }
  }

  private convertToPercentage(index: number): number {
    if (index === 0) {
      return -0.1;
    }
    const result = index-1<0 ? 0 : index-1;
    return result / 4;
  }

  private animationLoop() {
    if (this.progressingSlider!.value < this.progressingSliderAnimationTarget) {
      this.progressingSlider!.value += 0.02;
      setTimeout(() => this.animationLoop(), 10);
    } else {
      this.progressingSliderAnimationOngoing = false;
      if (this.progressingSlider!.value >= 1) {
        this.header!.text = 'Done!';
      }
    }
  }

  protected getHeader(): string {
    return '';
  }

  public updateDataFetchStatus(filesAmount: number, linesAmount: number): void {
    if (this.progressingTextDataFetchStatus) {
      this.progressingTextDataFetchStatus.text = `${filesAmount} files and ${linesAmount} lines of code read`;
    }
  }
}
