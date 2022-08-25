import {World} from '../../../world';
import {Button, Grid, Style, TextBlock} from '@babylonjs/gui/2D';
import {MenuItem} from './menuItem';
import {App} from '../../../../application/app';
import {UnprocessedComponent} from '../../../../../dataLayer/model/projectData/unprocessed/unprocessedComponent';
import {ProcessedComponent} from '../../../../../dataLayer/model/projectData/processed/processedComponent';
import {ProjectDataChangedObserver} from '../../../../../dataLayer/model/projectData/projectData';

// eslint-disable-next-line no-unused-vars
enum Alignment {
    // eslint-disable-next-line no-unused-vars
    LEFT, RIGHT
}

export class GuiProjectStatisticsMenu implements MenuItem, ProjectDataChangedObserver {
  private layout: Grid | null = null;
  private textStyle: Style | null = null;
  private world: World | null = null;
  private showingProjectStatistics = true;

  constructor(
      private appContext: App,
  ) {
    this.appContext.getDataContext().subscribeToProjectDataChanged(this);
  }

  public draw(layout: Grid | null, textStyle: Style | null, world: World | null): void {
    this.resetView(layout);

    this.layout = layout;
    this.textStyle = textStyle;
    this.world = world;

    layout?.addColumnDefinition(40, true);
    layout?.addColumnDefinition(1);
    layout?.addColumnDefinition(40, true);
    layout?.addRowDefinition(20, true);
    layout?.addRowDefinition(1);
    layout?.addRowDefinition(130, true);
    layout?.addRowDefinition(30, true);

    if (this.showingProjectStatistics) {
      this.showProjectStatistics(layout, textStyle, world);
    } else {
      this.showCityMetaphors(layout, textStyle, world);
    }
  }

  private showCityMetaphors(layout: Grid | null, textStyle: Style | null, world: World | null): void {
    const metricsLayout = new Grid();
    metricsLayout.addColumnDefinition(1);
    metricsLayout.addColumnDefinition(0.9);
    layout?.addControl(metricsLayout, 1, 1);

    this.createTextBlock('Building Height', metricsLayout, 0, 0, Alignment.LEFT, 55);
    this.createTextBlock('Building Width', metricsLayout, 1, 0, Alignment.LEFT, 55);
    this.createTextBlock('Building Type', metricsLayout, 2, 0, Alignment.LEFT, 55);
    this.createTextBlock('Window Lights', metricsLayout, 3, 0, Alignment.LEFT, 55);
    this.createTextBlock('Clouds', metricsLayout, 4, 0, Alignment.LEFT, 55);
    this.createTextBlock('Line Count', metricsLayout, 0, 1, Alignment.RIGHT, 55);
    this.createTextBlock('Method Count', metricsLayout, 1, 1, Alignment.RIGHT, 55);
    this.createTextBlock('Java Item Type', metricsLayout, 2, 1, Alignment.RIGHT, 55);
    this.createTextBlock('Field Count', metricsLayout, 3, 1, Alignment.RIGHT, 55);
    this.createTextBlock('Avg Line Width', metricsLayout, 4, 1, Alignment.RIGHT, 55);

    const showProjectStatisticsButton = this.createSwitchButton('showProjectStatisticsButton', 'Show Project Statistics', textStyle);
    layout?.addControl(showProjectStatisticsButton, 2, 1);
    showProjectStatisticsButton.onPointerUpObservable.add(() => {
      this.showingProjectStatistics = true;
      this.draw(layout, textStyle, world);
    });
  }

  private showProjectStatistics(layout: Grid | null, textStyle: Style | null, world: World | null): void {
    const metricsLayout = new Grid();
    metricsLayout.addColumnDefinition(1);
    metricsLayout.addColumnDefinition(1);
    layout?.addControl(metricsLayout, 1, 1);

    let unprocessed: UnprocessedComponent | null = null;
    let processed: ProcessedComponent | null = null;
    try {
      unprocessed = this.appContext.getDataContext().getUnprocessedProject();
      processed = this.appContext.getDataContext().getProcessedProject();
    } catch (e) {
    }
    const classes = processed?.getClassCount();
    const interfaces = processed?.getInterfaceCount();
    const enums = processed?.getEnumCount();
    this.createTextBlock('City', metricsLayout, 0, 0, Alignment.LEFT);
    this.createTextBlock('Mayor', metricsLayout, 1, 0, Alignment.LEFT);
    this.createTextBlock('Quarters', metricsLayout, 2, 0, Alignment.LEFT);
    this.createTextBlock('Buildings', metricsLayout, 3, 0, Alignment.LEFT);
    this.createTextBlock('Files', metricsLayout, 4, 0, Alignment.LEFT);
    this.createTextBlock('Lines', metricsLayout, 5, 0, Alignment.LEFT);
    this.createTextBlock('Classes', metricsLayout, 6, 0, Alignment.LEFT);
    this.createTextBlock('Interfaces', metricsLayout, 7, 0, Alignment.LEFT);
    this.createTextBlock('Enums', metricsLayout, 8, 0, Alignment.LEFT);
    this.createTextBlock(this.appContext.getDataContext().getGithubInformation()?.getRepository() + '', metricsLayout, 0, 1, Alignment.RIGHT);
    this.createTextBlock(this.appContext.getDataContext().getGithubInformation()?.getUsername() + '', metricsLayout, 1, 1, Alignment.RIGHT);
    this.createTextBlock(processed?.getPackageCount() + '', metricsLayout, 2, 1, Alignment.RIGHT);
    this.createTextBlock(((classes || 0) + (interfaces || 0) + (enums || 0)) + '', metricsLayout, 3, 1, Alignment.RIGHT);
    this.createTextBlock(unprocessed?.getFileCount() + '', metricsLayout, 4, 1, Alignment.RIGHT);
    this.createTextBlock(unprocessed?.getLineCount() + '', metricsLayout, 5, 1, Alignment.RIGHT);
    this.createTextBlock(classes + '', metricsLayout, 6, 1, Alignment.RIGHT);
    this.createTextBlock(interfaces + '', metricsLayout, 7, 1, Alignment.RIGHT);
    this.createTextBlock(enums + '', metricsLayout, 8, 1, Alignment.RIGHT);

    const showCityMetaphorsButton = this.createSwitchButton('showCityMetaphorsButton', 'Show City Metaphors', textStyle);
    layout?.addControl(showCityMetaphorsButton, 2, 1);
    showCityMetaphorsButton.onPointerUpObservable.add(() => {
      this.showingProjectStatistics = false;
      this.draw(layout, textStyle, world);
    });
  }

  private createSwitchButton(name: string, text: string, textStyle: Style | null): Button {
    const button = Button.CreateSimpleButton(name, text);
    button.paddingTopInPixels = 0;
    button.paddingBottomInPixels = 10;
    button.color = 'white';
    button.cornerRadius = 20;
    button.fontSize = 70;
    button.background = '#275082';
    button.style = textStyle;
    return button;
  }

  protected setHeader(): string {
    return 'Menu';
  }

  private createTextBlock(name: string, layout: Grid, row: number, column: number, alignment: Alignment, fixedFont?: number) {
    const textBlock = new TextBlock();
    textBlock.color = '#494949';
    textBlock.textHorizontalAlignment = alignment;
    textBlock.textWrapping = true;
    textBlock.text = name;
    if (name.length > 12 && !fixedFont) {
      textBlock.fontSize = name.length * -1.1 + 61;
    } else if (!fixedFont) {
      textBlock.fontSize = 60;
    } else {
      textBlock.fontSize = fixedFont;
    }
    textBlock.fontFamily = 'Lato';
    alignment===Alignment.LEFT && layout.addRowDefinition(80, true);
    layout.addControl(textBlock, row, column);
  }

  private resetView(layout: Grid | null): void {
    for (let i=0; i<20; i++) {
      layout?.removeColumnDefinition(0);
      layout?.removeRowDefinition(0);
    }
  }

  public projectDataUpdated(): void {
    this.draw(this.layout, this.textStyle, this.world);
  }

  public onAboutToBeDeactivated() {
  }
}
