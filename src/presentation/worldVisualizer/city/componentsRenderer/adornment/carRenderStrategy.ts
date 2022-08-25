import {Animation, IAnimationKey, SceneLoader, AbstractMesh} from '@babylonjs/core';
import {Vector3} from '@babylonjs/core/Maths/math';
import {Dimension} from '../../../../../dataLayer/model/projectData/layout/dimension';
import {Position} from '../../../../../dataLayer/model/projectData/layout/internal';
import {World} from '../../../internal.lazy';
import {ICar} from '../interfaces/iCar';

export abstract class CarRenderStrategy {
  constructor(protected world: World) { }
  public abstract renderCar(name: string, position: Position, dimension: Dimension, nestingDepth: number, car: ICar): void;
}

export class NullCarRenderStrategy extends CarRenderStrategy {
  constructor(world: World) {
    super(world);
  }

  public renderCar(name: string, position: Position, dimension: Dimension, nestingDepth: number, car: ICar): void {
    // do nothing
  }
}

export class AnimatedCarRenderStrategy extends CarRenderStrategy {
  private FRAME_RATE = 400;
  constructor(world: World) {
    super(world);
  }

  public renderCar(name: string, position: Position, dimension: Dimension, nestingDepth: number, car: ICar): void {
    const xPosLocal = position.X + dimension.xDim / 2 - this.world.getCity().getCityWidth() / 2;
    const yPosLocal = dimension.yDim / 2;
    const zPosLocal = position.Y + dimension.zDim / 2 - this.world.getCity().getCityWidth() / 2;
    this.startAnimation(xPosLocal, yPosLocal, zPosLocal, dimension, nestingDepth, car);
  }

  private startAnimation(x: number, y: number, z: number, dimension: Dimension, nestingDepth: number, car: ICar): void {
    const rotation = (dimension.xDim > dimension.zDim) ? Math.PI / 2 : 0;
    let scaling = car.scaling * Math.min(dimension.xDim, dimension.zDim);
    scaling /= nestingDepth === 1 ? 4 : 2;
    SceneLoader.ImportMesh('', car.path, car.name, this.world.getScene(), (meshes) => {
      meshes[0].scaling.set(scaling, scaling, scaling);
      meshes[0].position.set(x, y, z);
      meshes[0].rotation = new Vector3(0, rotation, 0);
      this.driving(meshes[0], x, z, dimension.xDim, dimension.zDim, nestingDepth, rotation);
      meshes[0].parent = this.world.getCity().getCityTransformNode();
      this.world.getScene().beginAnimation(meshes[0], 0, 800, true);
      this.world.getCity().addObjectToMeshArray(meshes[0]);
    });
  }

  private driving(car: AbstractMesh, x: number, z: number, xDim: number, zDim: number, nestingDepth: number, rotation: number) {
    if (xDim > zDim) {
      this.rotateCar(car, rotation);
      this.carDriving('x', x, nestingDepth === 1 ? xDim * 0.95 * 3 / 4 / 2 : xDim * 0.95 / 2, car);
      this.carChangeSite('z', z, nestingDepth === 1 ? zDim * 0.95 * 3 / 4 / 4 : zDim * 0.95 / 4, car);
    } else {
      this.rotateCar(car, rotation);
      this.carDriving('z', z, nestingDepth === 1 ? zDim * 0.95 * 3 / 4 / 2 : zDim * 0.95 / 2, car);
      this.carChangeSite('x', x, nestingDepth === 1 ? xDim * 0.95 * 3 / 4 / 4 : xDim * 0.95 / 4, car);
    }
  }

  private rotateCar(mesh: AbstractMesh, rotation: number) {
    const carTurn = new Animation('carTurnaround', `rotation.y`, 10, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    const animTurnKeys: IAnimationKey[] = [];
    animTurnKeys.push({frame: 0, value: rotation});
    animTurnKeys.push({frame: (this.FRAME_RATE / 2) - 5, value: rotation});
    animTurnKeys.push({frame: (this.FRAME_RATE / 2) + 5, value: rotation - Math.PI});
    animTurnKeys.push({frame: this.FRAME_RATE - 10, value: rotation - Math.PI});
    animTurnKeys.push({frame: this.FRAME_RATE - 1, value: rotation - 2 * Math.PI});
    carTurn.setKeys(animTurnKeys);
    mesh.animations.push(carTurn);
  }

  private carChangeSite(direction: string, x: number, dim: number, car: AbstractMesh) {
    const animChangeSite = new Animation(`carChangeSite${direction.toUpperCase()}`, `position.${direction}`, 10,
        Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    const animKeys: IAnimationKey[] = [];
    animKeys.push({frame: 0, value: direction === 'z' ? x - dim : x + dim});
    animKeys.push({frame: (this.FRAME_RATE / 2) - 5, value: direction === 'z' ? x - dim : x + dim});
    animKeys.push({frame: (this.FRAME_RATE / 2) + 5, value: direction === 'z' ? x + dim : x - dim});
    animKeys.push({frame: this.FRAME_RATE - 10, value: direction === 'z' ? x + dim : x - dim});
    animKeys.push({frame: this.FRAME_RATE - 1, value: direction === 'z' ? x - dim : x + dim});
    animChangeSite.setKeys(animKeys);
    car.animations.push(animChangeSite);
  }

  private carDriving(direction: string, x: number, dim: number, car: AbstractMesh) {
    const animCar = new Animation(`carDriving${direction.toUpperCase()}`, `position.${direction}`, 10,
        Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    const animCarKeys: IAnimationKey[] = [];
    animCarKeys.push({frame: 0, value: x - dim});
    animCarKeys.push({frame: this.FRAME_RATE / 2, value: x + dim});
    animCarKeys.push({frame: this.FRAME_RATE, value: x - dim});
    animCar.setKeys(animCarKeys);
    car.animations.push(animCar);
  }
}
