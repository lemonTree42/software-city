import {CityItem} from './internal';
import {Position} from '../internal';
import {ICityComponentRenderer} from '../../../../../presentation/worldVisualizer/city/componentsRenderer/internal.lazy';
import {CityItemObject} from './cityItemsInterfaces';
import {Dimension} from '../dimension';

export class Street extends CityItem {
  constructor(
      dimension: Dimension,
      hidden: boolean,
      name: string,
      position: Position,
      private nestingDepth: number,
  ) {
    super(dimension, hidden, name, position);
  }

  render(renderer: ICityComponentRenderer): void {
    renderer.renderStreet(this.name, this.position, this.dimension, this, this.nestingDepth);
  }

  toDTO(): CityItemObject {
    return {
      street: {
        hidden: this.hidden,
        depth: this.dimension.yDim,
        nestingDepth: this.nestingDepth,
        dimension: {
          width: this.dimension.xDim,
          height: this.dimension.zDim,
        },
        position: {
          x: this.position.X,
          y: this.position.Y,
        },
      },
    };
  }

  public static fromDTO(dto: CityItemObject): Street {
    const s = dto.street;
    return new Street(new Dimension(s!.dimension.width, s!.depth, s!.dimension.height), s!.hidden,
        'street', new Position(s!.position.x, s!.position.y), s!.nestingDepth);
  }
}
