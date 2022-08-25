import {Vector3} from '@babylonjs/core/Maths/math';
import {SceneLoader, Space} from '@babylonjs/core';
import {Position} from '../../../../../dataLayer/model/projectData/layout/position';
import {World} from '../../../world';

export abstract class FrontYardRenderStrategy {
  constructor(
      protected world: World,
  ) {
  }

  public abstract renderFrontYard(position: Position, xDim: number, zDim: number, treeWidth: number): void;
}

export class NullFrontYardRenderStrategy extends FrontYardRenderStrategy {
  constructor(
      world: World,
  ) {
    super(world);
  }

  public renderFrontYard(position: Position, xDim: number, zDim: number, treeWidth: number): void {
    // do nothing
  }
}

export class TreeFrontYardRenderStrategy extends FrontYardRenderStrategy {
  constructor(
      world: World,
  ) {
    super(world);
  }

  public renderFrontYard(position: Position, xDim: number, zDim: number, treeWidth: number): void {
    const xPosLocal = - position.X + this.world.getCity().getCityWidth() / 2;
    const zPosLocal = position.Y - this.world.getCity().getCityWidth() / 2;
    treeWidth /= 1.33;
    treeWidth = treeWidth<0.03?0.03:treeWidth;
    const treeAreaWidth = treeWidth;
    const scaleDownFactor = 1.6;
    const effectiveTreeWidth = treeAreaWidth/scaleDownFactor;
    const padding = (treeAreaWidth - effectiveTreeWidth) / 2;
    for (let i=0; i<xDim/treeAreaWidth-1; i+=0.7) {
      for (let j=0; j<zDim/treeAreaWidth-1; j+=0.7) {
        if (Math.random()>0.85) continue;
        SceneLoader.ImportMesh('', 'models/trees/', `tree${this.getRandomInt(2)}.gltf`, this.world.getScene(), (meshes) => {
          meshes[0].parent = this.world.getCity().getCityTransformNode();
          meshes[0].translate(new Vector3(
              xPosLocal-i*treeAreaWidth-treeAreaWidth/2+this.getRandomFloat(-padding, padding),
              0,
              zPosLocal+j*treeAreaWidth+treeAreaWidth/2+this.getRandomFloat(-padding, padding),
          ), 1, Space.LOCAL);
          const customSize = this.getRandomFloat(effectiveTreeWidth*0.5, effectiveTreeWidth*1.2);
          meshes[0].scaling = new Vector3(customSize, customSize, customSize);
          this.world.getCity().addTreeToList(meshes[0]);
          this.world.getLighting().getShadowGeneratorSmallScale().addShadowCaster(meshes[0]);
          this.world.getLighting().getShadowGeneratorLargeScale().addShadowCaster(meshes[0]);
          meshes.forEach((mesh) => mesh.receiveShadows = true);
        });
      }
    }
  }

  private getRandomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
}
