import {CityItem, BuildingFrontYard} from './internal';
import {Metrics} from '../../processed/javaItems/internal';
import {Position} from '../position';
import {ICityComponentRenderer} from '../../../../../presentation/worldVisualizer/city/componentsRenderer/internal.lazy';
import {CityItemObject} from './cityItemsInterfaces';
import {Dimension} from '../dimension';

export class Building extends CityItem {
  constructor(
      dimension: Dimension,
      hidden: boolean,
      name: string,
      position: Position,
    private type: string,
    private metrics: Metrics,
    private frontYards: BuildingFrontYard[]) {
    super(dimension, hidden, name, position);
  }

  public render(renderer: ICityComponentRenderer): void {
    if (!this.hidden) {
      renderer.renderBuilding(this.name, this.position, this.dimension, this, this.type);
      if (this.frontYards[0]) {
        for (let i=0; i<this.frontYards.length; i++) {
          renderer.renderBuildingFrontYard(this.name, this.frontYards[i].position, this.frontYards[i].width,
              this.frontYards[i].height, this.frontYards[i].treeWidth, this.areFrontYardsRotated(), i);
        }
      }
    }
  }

  public getType(): string {
    switch (this.type) {
      case 'JavaClass':
        return 'Class';
      case 'JavaInterface':
        return 'Interface';
      case 'JavaEnum':
        return 'Enum';
      default:
        return 'Unknown';
    }
  }

  public getMetrics(): Metrics {
    return this.metrics;
  }

  public isHidden(visible: boolean) {
    this.hidden = visible;
  }

  private areFrontYardsRotated(): boolean {
    if (this.frontYards.length !== 2) return false;
    const precision = 0.0001;
    return Math.abs(this.frontYards[0].position.X - this.frontYards[1].position.X) <= precision;
  }

  toDTO(): CityItemObject {
    const metrics = this.metrics?.toDTO();
    const frontYards = this.frontYards.map((frontYard) => frontYard.toDTO());
    return {
      building: {
        name: this.name,
        hidden: this.hidden,
        depth: this.dimension.yDim,
        dimension: {
          width: this.dimension.xDim,
          height: this.dimension.zDim,
        },
        position: {
          x: this.position.X,
          y: this.position.Y,
        },
        type: this.type,
        metrics: metrics.metrics,
        frontYards: frontYards,
      },
    };
  }

  public static fromDTO(dto: CityItemObject): Building {
    const b = dto.building;
    const metrics = Metrics.fromDTO(b!.metrics);
    const frontYards = b?.frontYards?.map((fy) => BuildingFrontYard.fromDTO(fy)) || [];
    return new Building(
        new Dimension(
        b!.dimension.width,
        b!.depth,
        b!.dimension.height),
      b!.hidden,
      b!.name,
      new Position(b!.position.x, b!.position.y),
      b!.type,
      metrics,
      frontYards);
  }
}
