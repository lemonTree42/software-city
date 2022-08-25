import {BuildingRenderStrategy} from './buildingRenderStrategy';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {Position} from '../../../../../dataLayer/model/projectData/layout/position';
import {Building} from '../../../../../dataLayer/model/projectData/layout/cityItems/building';
import {Color3, Vector3} from '@babylonjs/core/Maths/math';
import {AbstractMesh, SceneLoader, Space, StandardMaterial} from '@babylonjs/core';
import {World} from '../../../world';
import {CityLayoutBuildStrategy} from '../../../../../businessLogic/cityLayoutBuilder/cityLayoutBuildStrategy';
import {Dimension} from '../../../../../dataLayer/model/projectData/layout/dimension';

export class BlenderBuildingRenderStrategy extends BuildingRenderStrategy {
  private readonly WINDOW_GLOW_MATERIALS: StandardMaterial[] = [];
  private readonly WINDOW_GLOW_GRADATION_COUNT: number = 7;

  constructor(
      world: World,
  ) {
    super(world);
    for (let i = 0; i < this.WINDOW_GLOW_GRADATION_COUNT; i++) {
      const material = new StandardMaterial('windowGlowMaterial', world.getScene());
      material.emissiveColor = new Color3((i) / 6, (i) / 6, 0);
      this.WINDOW_GLOW_MATERIALS.push(material);
    }
  }

  public renderBuilding(name: string, position: Position, dimension: Dimension, backReference: Building,
      isFirstTimeRendering: boolean, options?: {type?: string}): void {
    const posLocal = new Position(
        - position.X - dimension.xDim / 2 + this.world.getCity().getCityWidth() / 2,
        + position.Y + dimension.zDim / 2 - this.world.getCity().getCityWidth() / 2,
    );
    if (backReference.getMetrics().containsMainMethod) {
      this.renderTownHall(dimension, posLocal, backReference);
      return;
    }

    switch (options?.type || '') {
      case 'JavaInterface':
        this.renderInterface(dimension, posLocal, backReference);
        break;
      case 'JavaEnum':
        this.renderEnum(dimension, posLocal, backReference);
        break;
      case 'JavaClass':
        this.renderClass(dimension, posLocal, backReference);
        break;
      default: this.renderClass(dimension, posLocal, backReference);
    }
  }

  private renderTownHall(dimension:Dimension, posLocal: Position, backReference: Building) {
    const heightThresholds = [0.25, 0.5, 0.75, 2]; // percentage of max building height
    const heights = [dimension.yDim/0.8, dimension.yDim/1.2, dimension.yDim/2.3, dimension.yDim/2.9]; // denominator taken from effective height of gltf model
    this.importCustomMesh(heightThresholds, heights, dimension, posLocal, backReference, 'classMain', 'townhall');
  }

  private renderClass(dimension:Dimension, posLocal: Position, backReference: Building) {
    const heightThresholds = [0.06, 0.17, 0.7, 2]; // percentage of max building height
    const heights = [dimension.xDim, dimension.xDim, dimension.yDim/3.72, dimension.yDim/4.91]; // denominator taken from effective height of gltf model
    this.importCustomMesh(heightThresholds, heights, dimension, posLocal, backReference, 'class', 'classes');
  }

  private renderInterface(dimension:Dimension, posLocal: Position, backReference: Building) {
    const heightThresholds = [0.06, 0.17, 2]; // percentage of max building height
    const heights = [dimension.xDim, dimension.xDim, dimension.yDim/3.72]; // denominator taken from effective height of gltf model
    this.importCustomMesh(heightThresholds, heights, dimension, posLocal, backReference, 'interface', 'interfaces');
  }

  private renderEnum(dimension:Dimension, posLocal: Position, backReference: Building) {
    const heightThresholds = [0.06, 0.17, 2]; // percentage of max building height
    const heights = [dimension.xDim, dimension.xDim, dimension.yDim/3.72]; // denominator taken from effective height of gltf model
    this.importCustomMesh(heightThresholds, heights, dimension, posLocal, backReference, 'enum', 'enums');
  }

  private importCustomMesh(heightThresholds: number[], heights: number[], dimension: Dimension,
      posLocal: Position, backReference: Building, filename: string, path: string) {
    for (let i = 0; i < heightThresholds.length; i++) {
      if (dimension.yDim <= CityLayoutBuildStrategy.EFFECTIVE_MAX_BUILDING_HEIGHT * heightThresholds[i]) {
        SceneLoader.ImportMesh('', `models/buildings/${path}/`, `${filename}${i}.gltf`, this.world.getScene(), (meshes) => {
          this.initMeshes(meshes, posLocal.X, 0, posLocal.Y, backReference);
          meshes[0].scaling = new Vector3(dimension.xDim, heights[i], dimension.zDim);
        });
        break;
      }
    }
  }

  private initMeshes(meshes: AbstractMesh[], xPosLocal: number, yPosLocal: number, zPosLocal: number, backReference: Building) {
    meshes[0].parent = this.world.getCity().getCityTransformNode();
    meshes[0].translate(new Vector3(xPosLocal, yPosLocal, zPosLocal), 1, Space.LOCAL);
    meshes[0].rotation = new Vector3(0, (Math.PI / 2) * this.getRandomInt(4), 0);

    this.world.getLighting().getShadowGeneratorSmallScale().addShadowCaster(meshes[0]);
    this.world.getLighting().getShadowGeneratorLargeScale().addShadowCaster(meshes[0]);
    let lightIntensity = Math.floor(backReference.getMetrics().fieldCount / 4);
    lightIntensity = lightIntensity >= this.WINDOW_GLOW_GRADATION_COUNT ? this.WINDOW_GLOW_GRADATION_COUNT - 1 : lightIntensity;
    meshes.forEach((mesh) => {
      this.world.getCity().addBuildingToMeshMapping(mesh, backReference);
      mesh.receiveShadows = true;
      if (mesh.material?.name.startsWith('Window')) {
        mesh.material = this.WINDOW_GLOW_MATERIALS[lightIntensity];
      }
      if (mesh.material?.name.startsWith('Walls')) {
        const material = new StandardMaterial('wallMaterial', this.world.getScene());
        material.diffuseColor = new Color3(200 / 255, 200 / 255, 200 / 255);
        mesh.material = material;
      }
      if (mesh.material?.name.startsWith('Wall_small')) {
        const material = new StandardMaterial('wallMaterial', this.world.getScene());
        material.diffuseColor = new Color3(1, 1, 1);
        mesh.material = material;
      }
      if (mesh.material?.name.startsWith('Townhall_Glow')) {
        (<any>mesh.material).emissiveColor = new Color3(0 / 255, 242 / 255, 1);
      }
    });
  }

  protected applyMaterial(component: Mesh, options?: { type?: string }): void {
  }

  private getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }
}
