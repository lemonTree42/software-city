import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {Animation, IAnimationKey, Space} from '@babylonjs/core';
import {Building, Position} from '../../../../../dataLayer/model/projectData/layout/internal';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {Vector3} from '@babylonjs/core/Maths/math';
import {World, Animatable} from '../../../internal.lazy';
import {Dimension} from '../../../../../dataLayer/model/projectData/layout/dimension';

export abstract class BuildingRenderStrategy implements Animatable {
  constructor(
    protected world: World,
  ) {
  }

  public renderBuilding(name: string, position: Position, dimension: Dimension, backReference: Building,
      isFirstTimeRendering: boolean, options?: object): void {
    const xPosLocal = position.X + dimension.xDim / 2 - this.world.getCity().getCityWidth() / 2;
    const yPosLocal = dimension.yDim / 2;
    const zPosLocal = position.Y + dimension.zDim / 2 - this.world.getCity().getCityWidth() / 2;
    const meshBuilding = MeshBuilder.CreateBox(name, {height: dimension.yDim, width: dimension.xDim, depth: dimension.zDim});
    meshBuilding.parent = this.world.getCity().getCityTransformNode();
    meshBuilding.translate(new Vector3(xPosLocal, yPosLocal, zPosLocal), 1, Space.LOCAL);
    this.applyMaterial(meshBuilding, options);
    if (isFirstTimeRendering) {
      this.startAnimation(xPosLocal, yPosLocal, zPosLocal, dimension, meshBuilding);
    }
    this.world.getCity().addBuildingToMeshMapping(meshBuilding, backReference);
    this.world.getLighting().getShadowGeneratorSmallScale().addShadowCaster(meshBuilding);
    this.world.getLighting().getShadowGeneratorLargeScale().addShadowCaster(meshBuilding);
    meshBuilding.receiveShadows = true;
  }

  public startAnimation(xPosLocal: number, yPosLocal: number, zPosLocal: number, dimension: Dimension, component: Mesh): void {
    const startFrame = 0;
    const endFrame = 10;
    const frameRate = 3 / dimension.yDim;
    const ySlide = new Animation('ySlide', 'position.y', frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    const keyFrames: IAnimationKey[] = [];
    keyFrames.push({frame: startFrame, value: -yPosLocal});
    keyFrames.push({frame: endFrame, value: yPosLocal});
    ySlide.setKeys(keyFrames);
    component.animations.push(ySlide);
    this.world.getScene().beginAnimation(component, startFrame, endFrame, false);
  }

  protected abstract applyMaterial(component: Mesh, options?: { type?: string });
}
