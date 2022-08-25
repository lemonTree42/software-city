import {Animation, IAnimationKey, SceneLoader, StandardMaterial} from '@babylonjs/core';
import {Color3} from '@babylonjs/core/Maths/math';
import {Dimension} from '../../../../../dataLayer/model/projectData/layout/dimension';
import {Position} from '../../../../../dataLayer/model/projectData/layout/internal';
import {World, Animatable} from '../../../internal.lazy';

export class SkullRenderer implements Animatable {
  constructor(private world: World) { }

  public renderSkull(name: string, position: Position, dimension: Dimension): void {
    const xPosLocal = position.X + dimension.xDim / 2 - this.world.getCity().getCityWidth() / 2;
    const yPosLocal = dimension.yDim + 0.1;
    const zPosLocal = position.Y + dimension.zDim / 2 - this.world.getCity().getCityWidth() / 2;
    this.startAnimation(xPosLocal, yPosLocal, zPosLocal, dimension);
  }

  public startAnimation(x: number, y: number, z: number, dimension: Dimension) {
    const city = this.world.getCity();
    SceneLoader.ImportMesh('', 'textures/', 'skull.babylon', this.world.getScene(), (meshes) => {
      meshes[0].scaling.set(0.001, 0.001, 0.001);
      meshes[0].position.set(x, y + dimension.yDim + 0.1, z);
      meshes[0].useVertexColors = true;

      const material = new StandardMaterial('defaultBuildingMaterial', this.world.getScene());
      material.diffuseColor = new Color3(255, 0, 0);
      meshes[0].material = material;

      const jumping = new Animation('jumping', `position.y`, 10, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
      const jumpKeys: IAnimationKey[] = [];
      jumpKeys.push({frame: 0, value: y});
      jumpKeys.push({frame: 20, value: y + 0.05});
      jumpKeys.push({frame: 40, value: y});
      jumping.setKeys(jumpKeys);

      const rotate = new Animation('rotate', `rotation.y`, 1, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
      const rotateKeys: IAnimationKey[] = [];
      rotateKeys.push({frame: 0, value: 0});
      rotateKeys.push({frame: 40, value: Math.PI * 2});
      rotate.setKeys(rotateKeys);

      meshes[0].animations.push(jumping);
      meshes[0].animations.push(rotate);
      meshes[0].parent = city.getCityTransformNode();
      this.world.getCity().addObjectToMeshArray(meshes[0]);
      this.world.getScene().beginAnimation(meshes[0], 0, 40, true);
    });
  }
}
