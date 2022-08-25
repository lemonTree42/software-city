import {MinMax} from './enums';
import {LayoutingStrategy} from '../../../businessLogic/cityLayoutBuilder/strategies/strategies';

export interface IFilter {
    LoC: number,
    NoM: number,
    NoF: number,
    maxLoC: number,
    maxNoM: number,
    maxNoF: number,
}

export interface IFilterCheckBox {
    checkedClass: boolean,
    checkedInterface: boolean,
    checkedEnum: boolean,
}

export interface IMinMax {
    LoCMinMax: MinMax,
    NoMMinMax: MinMax,
    NoFMinMax: MinMax,
}

export interface IThreshold {
    LoC: number,
    NoM: number,
    NoF: number,
}

export interface IRenderSpecification {
    enhancedCity: boolean,
}

export interface ILayoutingSpecification {
    strategy: LayoutingStrategy,
}
