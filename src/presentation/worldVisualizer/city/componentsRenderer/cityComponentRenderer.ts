import {BuildingRenderStrategy} from './building/buildingRenderStrategy';
import {StreetRenderer} from './street/streetRenderer';
import {SkullRenderer} from './adornment/skullRenderer';
import {CarRenderStrategy} from './adornment/carRenderStrategy';
import {Building, Position, Street} from '../../../../dataLayer/model/projectData/layout/internal';
import {World} from '../../world';
import {ICityComponentRenderer} from './interfaces/iCityComponentRenderer';
import {AppConfig} from '../../../../dataLayer/model/configuration/internal';
import {FrontYardRenderStrategy} from './internal.lazy';
import {cars} from './adornment/carModels';
import {Dimension} from '../../../../dataLayer/model/projectData/layout/dimension';
import {SignRenderer} from './building/signRenderer';

export class CityComponentRenderer implements ICityComponentRenderer {
  constructor(
    private world: World,
    private buildingRenderer: BuildingRenderStrategy,
    private buildingFrontYardRenderer: FrontYardRenderStrategy,
    private signRenderer: SignRenderer,
    private streetRenderer: StreetRenderer,
    private objectRenderer: SkullRenderer,
    private carRenderer: CarRenderStrategy,
    private appConfig: AppConfig,
  ) {
  }

  public renderBuilding(name: string, position: Position, dimension: Dimension, backReference: Building, buildingType: string): void {
    this.buildingRenderer.renderBuilding(name, position, dimension, backReference, this.appConfig.isFirstTimeRendering, {type: buildingType});
    const threshold = this.appConfig.threshold;
    if (threshold.LoC <= backReference.getMetrics().lineCount || threshold.NoM <= backReference.getMetrics().methodCount ||
      threshold.NoF <= backReference.getMetrics().fieldCount) {
      this.objectRenderer.renderSkull(name, position, dimension);
    }
  }

  public renderStreet(name: string, position: Position, dimension: Dimension, backReference: Street, nestingDepth: number): void {
    this.streetRenderer.renderStreet(name, position, dimension, backReference, nestingDepth, this.appConfig.isFirstTimeRendering);
    if (Math.random() > 0.7) return;
    switch (nestingDepth) {
      case 1:
        if (Math.max(dimension.xDim, dimension.zDim) > 0.5) {
          this.carRenderer.renderCar(name, position, dimension, nestingDepth, cars[0]);
        } break;
      case 2:
        if (Math.max(dimension.xDim, dimension.zDim) > 0.35) {
          this.carRenderer.renderCar(name, position, dimension, nestingDepth, cars[1]);
        } break;
      case 3:
        if (Math.max(dimension.xDim, dimension.zDim) > 0.2) {
          this.carRenderer.renderCar(name, position, dimension, nestingDepth, cars[2]);
        } break;
      case 4:
        if (Math.max(dimension.xDim, dimension.zDim) > 0.2) {
          this.carRenderer.renderCar(name, position, dimension, nestingDepth, cars[3]);
        } break;
      case 5:
        if (Math.max(dimension.xDim, dimension.zDim) > 0.2) {
          this.carRenderer.renderCar(name, position, dimension, nestingDepth, cars[4]);
        } break;
    }
  }

  public renderBuildingFrontYard(name: string, position: Position, xDim: number, zDim: number,
      treeWidth: number, rotated: boolean, frontYardIndex: number): void {
    this.buildingFrontYardRenderer.renderFrontYard(position, xDim, zDim, treeWidth);
    this.signRenderer.renderSign(name, position, frontYardIndex, xDim, zDim, rotated);
  }
}
