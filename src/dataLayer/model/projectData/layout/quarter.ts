import {Building, CityComponent, Position} from './internal';
import {ICityComponentRenderer} from '../../../../presentation/worldVisualizer/city/componentsRenderer/internal.lazy';
import {CityItemObject, QuarterObject} from './cityItems/cityItemsInterfaces';
import {Dimension} from './dimension';

export class Quarter extends CityComponent {
  public addContent(newContent: CityComponent): void {
    this.content.push(newContent);
  }

  public render(renderer: ICityComponentRenderer): void {
    this.content.forEach((c: CityComponent) => {
      c.render(renderer);
    });
  }

  public toDTO(): QuarterObject {
    const result: CityItemObject[] = [];
    for (const c of Object.values(this.content)) {
      result.push(c.toDTO());
    }
    return {
      quarter: {
        position: {
          x: this.position.X,
          y: this.position.Y,
        },
        dimension: {
          width: this.dimension.xDim,
          height: this.dimension.zDim,
        },
        depth: this.dimension.yDim,
        hidden: this.hidden,
        name: this.name,
        content: result,
      },
    };
  }

  public static fromDTO(dto: QuarterObject): Quarter {
    const q = dto.quarter;
    const quarter = new Quarter(new Dimension(q.dimension.width, q.depth, q.dimension.height), q.hidden, q.name, new Position(q.position.x, q.position.y));
    dto.quarter.content.forEach((c: CityItemObject) => {
      const item = CityComponent.fromDTO(c);
      quarter.content.push(item);
    });
    return quarter;
  }

  public getBuildings(): Building[] {
    const buildings: Building[] = [];
    for (const component of this.content) {
      if (component instanceof Quarter) {
        component.getBuildings().forEach((building) => {
          buildings.push(building);
        });
      } else if (component instanceof Building) {
        buildings.push(component);
      }
    }
    return buildings;
  }

  public isHidden(visible: boolean) {
    this.content.forEach((c: CityComponent) => {
      c.isHidden(visible);
    });
  }
}
