import {MenuItem} from './menuItem';
import {Button, Grid, Style, TextBlock, StackPanel, Slider} from '@babylonjs/gui/2D';
import {World} from '../../../world';
import {BabylonJsController} from '../../../../controller/babylonJsController';
import {App} from '../../../../application/app';
import {AppConfig} from '../../../../../dataLayer/model/configuration/internal';
import {DisplayingStateStatus} from '../../../../application/states/internal';

export class GuiSettingMenu implements MenuItem {
  private LoC: number;
  private NoM: number;
  private NoF: number;
  private config: AppConfig;

  constructor(private babylonjsController: BabylonJsController, private appContext: App) {
    this.config = appContext.getDataContext().getConfig();
    this.LoC = this.config.threshold.LoC;
    this.NoM = this.config.threshold.NoM;
    this.NoF = this.config.threshold.NoF;
  }

  draw(layout: Grid, textStyle: Style, world: World): void {
    layout.addColumnDefinition(80, true);
    layout.addColumnDefinition(1);
    layout.addColumnDefinition(80, true);
    layout.addRowDefinition(40, true);
    layout.addRowDefinition(100, true);
    layout.addRowDefinition(1);
    layout.addRowDefinition(150, true);
    layout.addRowDefinition(80, true);

    const thresholdLayout = new Grid();
    thresholdLayout.addColumnDefinition(0.6);
    thresholdLayout.addColumnDefinition(0.4);
    thresholdLayout.addRowDefinition(0.25);
    thresholdLayout.addRowDefinition(0.25);
    thresholdLayout.addRowDefinition(0.25);
    thresholdLayout.addRowDefinition(0.25);
    layout.addControl(thresholdLayout, 2, 1);

    const titel = new TextBlock();
    titel.color = '#494949';
    titel.textWrapping = true;
    titel.textHorizontalAlignment = 0;
    titel.text = 'Customize Threshold:';
    titel.fontSize = 65;
    titel.fontFamily = 'Lato';

    layout.addControl(titel, 1, 1);

    this.createThreshold('Lines of Code', thresholdLayout, 0);
    this.createThreshold('Number of Methods', thresholdLayout, 1);
    this.createThreshold('Number of Fields', thresholdLayout, 2);
    this.createThresholdButton(thresholdLayout, 3, 1);

    this.createExitButton(textStyle, layout, 3, 1);
  }

  private setThreshold(): void {
    this.config.isFirstTimeRendering = false;
    this.config.threshold = {LoC: this.LoC, NoM: this.NoM, NoF: this.NoF};
    this.appContext.getCurrentState().finish(DisplayingStateStatus.settingsChanged);
  }

  private createThreshold(name: string, layout: Grid, row: number): void {
    this.createTextBlock(name, layout, row, 0);
    this.createSliderField(name, layout, row, 1);
  }

  private createExitButton(textStyle: Style, layout: Grid, row: number, column: number) {
    const exitVrButton = Button.CreateSimpleButton('exitVrButton', 'Exit VR');
    exitVrButton.paddingTopInPixels = 15;
    exitVrButton.paddingBottomInPixels = 15;
    exitVrButton.color = 'white';
    exitVrButton.cornerRadius = 20;
    exitVrButton.fontSize = 70;
    exitVrButton.background = '#275082';
    exitVrButton.style = textStyle;
    exitVrButton.onPointerUpObservable.add(() => this.babylonjsController.onExitVrClicked());
    layout.addControl(exitVrButton, row, column);
  }

  private createSliderField(name: string, layout: Grid, row: number, column: number): void {
    const panel = new StackPanel();
    panel.width = '280px';

    const slider = this.createSlider(name, row);
    slider.onValueChangedObservable.add((value) => {
      header.text = `${value}`;
      header.fontSize = 40;
      this.setMetric(name, value);
    });

    const header = new TextBlock();
    header.text = `${slider.value}`;
    header.height = '30px';
    header.color = 'black';
    header.fontSize = 40;
    header.fontFamily = 'Lato';

    panel.addControl(header);
    panel.addControl(slider);
    layout.addControl(panel, row, column);
  }

  private createSlider(name: string, row: number): Slider {
    const slider = new Slider(`slider${row}`);
    slider.step = -1;
    slider.color = '#275082';
    slider.borderColor = '#275082';
    slider.background = 'white';
    slider.minimum = 0;
    slider.maximum = 5000;
    slider.value = this.getMetric(name);
    slider.height = '30px';
    slider.width = '260px';
    slider.fontFamily = 'Lato';
    return slider;
  }

  private createTextBlock(name: string, layout: Grid, row: number, column: number) {
    const textBlock = new TextBlock();
    textBlock.color = '#494949';
    textBlock.textWrapping = true;
    textBlock.textHorizontalAlignment = 0;
    textBlock.text = name;
    if (name.length > 12) {
      textBlock.fontSize = name.length * -1.1 + 61;
    } else {
      textBlock.fontSize = 60;
    }
    textBlock.fontFamily = 'Lato';
    layout.addControl(textBlock, row, column);
  }

  private createThresholdButton(layout: Grid, row: number, column: number): void {
    const button = Button.CreateSimpleButton('threshold', 'Customize');
    button.width = '100%';
    button.height = 0.5;
    button.color = 'white';
    button.fontSize = 40;
    button.cornerRadius = 20;
    button.background = '#275082';
    button.onPointerClickObservable.add(() => {
      this.setThreshold();
    });
    layout.addControl(button, row, column);
  }

  private getMetric(metric: string): number {
    switch (metric) {
      case 'Lines of Code': return this.LoC;
      case 'Number of Methods': return this.NoM;
      case 'Number of Fields': return this.NoF;
      default: return 0;
    }
  }

  private setMetric(metric: string, value: number) {
    switch (metric) {
      case 'Lines of Code': this.LoC = value; break;
      case 'Number of Methods': this.NoM = value; break;
      case 'Number of Fields': this.NoF = value; break;
    }
  }

  public onAboutToBeDeactivated() {
  }
}
