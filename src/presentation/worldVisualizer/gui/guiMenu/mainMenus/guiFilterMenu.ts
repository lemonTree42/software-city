import {World} from '../../../world';
import {Grid, Style, TextBlock, SelectionPanel, RadioGroup, Button, StackPanel, Slider, Checkbox} from '@babylonjs/gui/2D';
import {MenuItem} from './menuItem';
import {City} from '../../../internal.lazy';
import {Building, Quarter} from '../../../../../dataLayer/model/projectData/layout/internal';
import {App} from '../../../../application/app';
import {AppConfig, MinMax} from '../../../../../dataLayer/model/configuration/internal';
import {DisplayingStateStatus} from '../../../../application/states/stateStatus';
import {Metrics} from '../../../../../dataLayer/model/projectData/processed/internal';

export class GuiFilterMenu implements MenuItem {
  private LoCMinMax: MinMax;
  private LoC: number;
  private NoMMinMax: MinMax;
  private NoM: number;
  private NoFMinMax: MinMax;
  private NoF: number;
  private checkedClass: boolean;
  private checkedInterface: boolean;
  private checkedEnum: boolean;
  private config: AppConfig;

  constructor(private city: City, private appContext: App) {
    this.config = appContext.getDataContext().getConfig();
    this.LoC = this.config.filter.LoC;
    this.NoM = this.config.filter.NoM;
    this.NoF = this.config.filter.NoF;
    this.LoCMinMax = this.config.minMax.LoCMinMax;
    this.NoMMinMax = this.config.minMax.NoMMinMax;
    this.NoFMinMax = this.config.minMax.NoFMinMax;
    this.checkedClass = this.config.filterCheckBox.checkedClass;
    this.checkedEnum = this.config.filterCheckBox.checkedEnum;
    this.checkedInterface = this.config.filterCheckBox.checkedInterface;
  }

  draw(layout: Grid, textStyle: Style, world: World): void {
    layout.addColumnDefinition(40, true);
    layout.addColumnDefinition(1);
    layout.addColumnDefinition(40, true);
    layout.addRowDefinition(30, true);
    layout.addRowDefinition(0.6);
    layout.addRowDefinition(0.2);
    layout.addRowDefinition(0.2);
    layout.addRowDefinition(30, true);

    const metricLayout = new Grid();
    metricLayout.addColumnDefinition(0.45);
    metricLayout.addColumnDefinition(0.15);
    metricLayout.addColumnDefinition(0.4);
    metricLayout.addRowDefinition(1);
    metricLayout.addRowDefinition(1);
    metricLayout.addRowDefinition(1);
    layout.addControl(metricLayout, 1, 1);

    const checkBoxLayout = new Grid();
    checkBoxLayout.addColumnDefinition(0.333);
    checkBoxLayout.addColumnDefinition(0.333);
    checkBoxLayout.addColumnDefinition(0.333);
    checkBoxLayout.addRowDefinition(1);
    layout.addControl(checkBoxLayout, 2, 1);
    if (this.config.isFirstTimeRendering) {
      this.setHighestMetrics();
    }
    this.createFilter('Lines of Code', metricLayout, 0);
    this.createFilter('Number of Methods', metricLayout, 1);
    this.createFilter('Number of Fields', metricLayout, 2);

    this.createCheckbox('Class', checkBoxLayout, 4, 0);
    this.createCheckbox('Interface', checkBoxLayout, 4, 1);
    this.createCheckbox('Enum', checkBoxLayout, 4, 2);

    this.createFilterButton(layout, 3);
  }

  private filter(): void {
    this.config.isFirstTimeRendering = false;
    this.config.filter.LoC = this.LoC;
    this.config.filter.NoM = this.NoM;
    this.config.filter.NoF = this.NoF;
    this.config.minMax = {LoCMinMax: this.LoCMinMax, NoFMinMax: this.NoFMinMax, NoMMinMax: this.NoMMinMax};
    this.config.filterCheckBox = {checkedClass: this.checkedClass, checkedEnum: this.checkedEnum, checkedInterface: this.checkedInterface};
    const cityLayout = this.appContext.getDataContext().getCityLayout();
    cityLayout.isHidden(false);
    const buildings: Building[] =(<Quarter>cityLayout).getBuildings();
    this.hideBuildings(buildings);
    this.appContext.getCurrentState().finish(DisplayingStateStatus.settingsChanged);
  }

  private hideBuildings(buildings: Building[]) {
    buildings.forEach((building) => {
      const metrics = building.getMetrics();
      const type = building.getType();
      building.isHidden(this.shouldHide(type, metrics));
    });
  }

  private shouldHide(type: string, metrics: Metrics): boolean {
    return this.checkIsChecked(type) || !this.checkIfLoCInScope(metrics) || !this.checkIfNoMInScope(metrics) || !this.checkIfNoFInScope(metrics);
  }

  private checkIfNoFInScope(metrics: Metrics): boolean {
    return this.NoFMinMax === MinMax.Min ? metrics.fieldCount >= this.NoF : metrics.fieldCount <= this.NoF;
  }

  private checkIfNoMInScope(metrics: Metrics): boolean {
    return this.NoMMinMax === MinMax.Min ? metrics.methodCount >= this.NoM : metrics.methodCount <= this.NoM;
  }

  private checkIfLoCInScope(metrics: Metrics): boolean {
    return this.LoCMinMax === MinMax.Min ? metrics.lineCount >= this.LoC : metrics.lineCount <= this.LoC;
  }

  private checkIsChecked(type: string): boolean {
    return (type === 'Class' && !this.checkedClass) || (type === 'Interface' && !this.checkedInterface) || (type === 'Enum' && !this.checkedEnum);
  }

  private createFilterButton(layout: Grid, row: number): void {
    const button = Button.CreateSimpleButton('filter', 'Filter Metrics');
    button.width = '100%';
    button.height = 0.5;
    button.color = 'white';
    button.fontSize = 40;
    button.cornerRadius = 20;
    button.background = '#275082';
    button.onPointerClickObservable.add(() => {
      this.filter();
    });
    layout.addControl(button, row, 1);
  }

  private createFilter(name: string, layout: Grid, row: number): void {
    this.createTextBlock(name, layout, row, 0);
    this.createMinMax(name, layout, row, 1);
    this.createSliderField(name, layout, row, 2);
  }

  private createCheckbox(name: string, layout: Grid, row: number, column: number) {
    const panel = new StackPanel();
    panel.width = '200px';
    panel.isVertical = false;

    const checkbox = new Checkbox();
    checkbox.width = '30px';
    checkbox.height = '30px';
    checkbox.color = '#275082';
    checkbox.background = 'white';
    checkbox.isChecked = this.isChecked(name);
    checkbox.onIsCheckedChangedObservable.add((value) => {
      this.setChecked(name, value);
    });
    panel.addControl(checkbox);

    const header = new TextBlock();
    header.text = name;
    header.width = '120px';
    header.paddingLeft = '5px';
    header.color = 'black';
    header.fontFamily = 'Lato';
    if (name.length > 5) {
      header.fontSize = name.length * -1.3 + 41;
    } else {
      header.fontSize = 40;
    }
    panel.addControl(header);
    layout.addControl(panel, row, column);
  }

  private createSliderField(name: string, layout: Grid, row: number, column: number): void {
    const panel = new StackPanel();
    panel.width = '280px';

    const slider = this.createSlider(name, row);
    slider.onValueChangedObservable.add((value) => {
      header.text = `${this.isMin(name) ? 'minimum' : 'maximum'} ${value}`;
      if (header.text.length > 12) {
        header.fontSize = header.text.length * -1.05 + 31;
      } else {
        header.fontSize = 40;
      }
      this.setMetric(name, value);
    });

    const header = new TextBlock();
    header.text = `${this.isMin(name) ? 'minimum' : 'maximum'} ${slider.value}`;
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
    slider.maximum = this.getHighestMetric(name);
    slider.value = this.getMetric(name);
    slider.height = '30px';
    slider.width = '260px';
    slider.fontFamily = 'Lato';
    return slider;
  }

  private createMinMax(metric: string, layout: Grid, row: number, column: number) {
    const selectBox = new SelectionPanel(`sp${row}`);
    const minMaxGroup = new RadioGroup(metric);
    minMaxGroup.header = '';
    minMaxGroup.addRadio('Min', () => {
      this.setMinMax(metric, MinMax.Min);
    }, this.isMin(metric));
    minMaxGroup.addRadio('Max', () => {
      this.setMinMax(metric, MinMax.Max);
    }, !this.isMin(metric));
    selectBox.addGroup(minMaxGroup);
    selectBox.paddingBottom = '10px';
    selectBox.paddingTop = '25px';
    selectBox.paddingLeft = '10px';
    selectBox.paddingRight = '10px';
    selectBox.fontSize = 30;
    layout.addControl(selectBox, row, column);
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

  private setHighestMetrics() {
    const config = this.appContext.getDataContext().getConfig();
    this.city.getBuildingMeshMapping().forEach((building) => {
      config.filter.maxLoC = Math.max(building.getMetrics().lineCount, config.filter.maxLoC);
      config.filter.maxNoM = Math.max(building.getMetrics().methodCount, config.filter.maxNoM);
      config.filter.maxNoF = Math.max(building.getMetrics().fieldCount, config.filter.maxNoF);
    });
  }

  private isChecked(name: string): boolean {
    switch (name) {
      case 'Class': return this.checkedClass;
      case 'Interface': return this.checkedInterface;
      case 'Enum': return this.checkedEnum;
      default: return true;
    }
  }

  private setChecked(name: string, value: boolean) {
    switch (name) {
      case 'Class': {this.checkedClass = value;} break;
      case 'Interface': {this.checkedInterface = value;} break;
      case 'Enum': {this.checkedEnum = value;} break;
    }
  }

  private isMin(metric: string): boolean {
    switch (metric) {
      case 'Lines of Code': return this.LoCMinMax === MinMax.Min;
      case 'Number of Methods': return this.NoMMinMax === MinMax.Min;
      case 'Number of Fields': return this.NoFMinMax === MinMax.Min;
      default: return false;
    }
  }

  private setMinMax(metric: string, minMax: MinMax) {
    switch (metric) {
      case 'Lines of Code': this.LoCMinMax = minMax; break;
      case 'Number of Methods': this.NoMMinMax = minMax; break;
      case 'Number of Fields': this.NoFMinMax = minMax; break;
    }
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

  private getHighestMetric(metric: string): number {
    switch (metric) {
      case 'Lines of Code': return this.config.filter.maxLoC;
      case 'Number of Methods': return this.config.filter.maxNoM;
      case 'Number of Fields': return this.config.filter.maxNoF;
      default: return 0;
    }
  }

  public onAboutToBeDeactivated() {
  }
}
