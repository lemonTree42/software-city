import {CityComponent} from '../../dataLayer/model/projectData/layout/internal';
import {ProcessedComponent} from '../../dataLayer/model/projectData/processed/internal';

export abstract class CityLayoutBuildStrategy {
  protected readonly STREET_WIDTH: number = 0.025;
  public static readonly EFFECTIVE_MAX_BUILDING_HEIGHT: number = 0.7;

  public abstract build(project: ProcessedComponent): CityComponent;
}
