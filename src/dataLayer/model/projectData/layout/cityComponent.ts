import {CityItem, Position, Quarter} from './internal';
import {InvalidArgumentError} from '../../../../utils/errorhandling/Errors';
import {ICityComponentRenderer} from '../../../../presentation/worldVisualizer/city/componentsRenderer/internal.lazy';
import {Dimension} from './dimension';

export abstract class CityComponent {
  protected content: CityComponent[] = [];

  constructor(
    protected dimension: Dimension,
    protected hidden: boolean,
    protected name: string,
    protected position: Position) {
  }

  public getName(): string {
    return this.name;
  }

  public addContent(newContent: CityComponent): void { }

  public getContent(): CityComponent[] {
    return this.content;
  }

  public abstract render(renderer: ICityComponentRenderer): void;

  public abstract toDTO(): object;

  public static fromDTO(dto: any): CityComponent {
    if (dto.quarter) {
      return Quarter.fromDTO(dto);
    } else if (dto.building || dto.street) {
      return CityItem.fromDTO(dto);
    }
    throw new InvalidArgumentError('unable create CityComponent from this DTO');
  }

  public getPosition(): Position {
    return this.position;
  }

  public isHidden(visible: boolean): void { }
}
