import {BuildingRenderStrategy} from './buildingRenderStrategy';
import {StandardMaterial} from '@babylonjs/core';
import {Color3} from '@babylonjs/core/Maths/math';
import {Mesh} from '@babylonjs/core/Meshes/mesh';

export class BasicBuildingRenderStrategy extends BuildingRenderStrategy {
  protected applyMaterial(component: Mesh, options?: {type?: string}): void {
    if (options) {
      switch (options.type) {
        case 'JavaClass':
          component.material = this.world.getCity().classBuildingMaterial;
          break;
        case 'JavaInterface':
          component.material = this.world.getCity().interfaceBuildingMaterial;
          break;
        case 'JavaEnum':
          component.material = this.world.getCity().enumBuildingMaterial;
          break;
      }
    } else {
      const material = new StandardMaterial('defaultBuildingMaterial', this.world.getScene());
      material.diffuseColor = new Color3(1, 0.96, 0.96);
      component.material = material;
    }
  }
}
