import {
  IFilter,
  IFilterCheckBox,
  ILayoutingSpecification,
  IMinMax,
  IRenderSpecification,
  IThreshold,
  MinMax,
} from './internal';
import {LayoutingStrategy} from '../../../businessLogic/cityLayoutBuilder/strategies/strategies';

export class AppConfig {
  public filter: IFilter;
  public minMax: IMinMax;
  public filterCheckBox: IFilterCheckBox;
  public threshold: IThreshold;
  public isFirstTimeRendering: boolean;
  public renderSpecification: IRenderSpecification;
  public layoutingSpecification: ILayoutingSpecification;
  public isDemoMode: boolean;

  constructor() {
    this.isFirstTimeRendering = true;
    this.filter = {
      LoC: 0,
      NoM: 0,
      NoF: 0,
      maxLoC: 0,
      maxNoM: 0,
      maxNoF: 0,
    };
    this.minMax = {
      LoCMinMax: MinMax.Min,
      NoMMinMax: MinMax.Min,
      NoFMinMax: MinMax.Min,
    };
    this.filterCheckBox = {
      checkedClass: true,
      checkedEnum: true,
      checkedInterface: true,
    };
    this.threshold = {
      LoC: 1000,
      NoM: 60,
      NoF: 60,
    };
    this.renderSpecification = {
      enhancedCity: false,
    };
    this.layoutingSpecification = {
      strategy: LayoutingStrategy.squarifiedTreemap,
    };
    this.isDemoMode = false;
  }
}
