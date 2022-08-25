import {Animation, IAnimationKey, Space, StandardMaterial, Texture, Vector4} from '@babylonjs/core';
import {Vector3} from '@babylonjs/core/Maths/math';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {Position, Street} from '../../../../../dataLayer/model/projectData/layout/internal';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {World, Animatable} from '../../../internal.lazy';
import {Dimension} from '../../../../../dataLayer/model/projectData/layout/dimension';

export class StreetRenderer implements Animatable {
  constructor(
    private world: World,
  ) {
  }

  private readonly STREET_TEXTURE_DIMENSIONS: { width: number, height: number }[] = [
    {width: 1106, height: 1500},
    {width: 964, height: 1000},
    {width: 745, height: 1000},
    {width: 690, height: 690},
    {width: 467, height: 700},
  ];

  public renderStreet(name: string, position: Position, dimension: Dimension, backReference: Street,
      nestingDepth: number, isFirstTimeRendering: boolean): Mesh {
    const xPosLocal = position.X + dimension.xDim / 2 - this.world.getCity().getCityWidth() / 2;
    const yPosLocal = dimension.yDim / 2;
    const zPosLocal = position.Y + dimension.zDim / 2 - this.world.getCity().getCityWidth() / 2;
    const faceUV = new Array(6);
    const meshStreet = MeshBuilder.CreateBox(name, {height: dimension.yDim, width: dimension.xDim, depth: dimension.zDim, faceUV: faceUV});
    meshStreet.parent = this.world.getCity().getCityTransformNode();
    meshStreet.translate(new Vector3(xPosLocal, yPosLocal, zPosLocal), 1, Space.LOCAL);
    this.applyStreetMaterial(meshStreet, dimension.xDim, dimension.zDim, nestingDepth, faceUV);
    if (isFirstTimeRendering) {
      this.startAnimation(xPosLocal, yPosLocal, zPosLocal, dimension, meshStreet);
    }
    this.world.getCity().addStreetToMeshMapping(meshStreet, backReference);
    meshStreet.receiveShadows = true;
    return meshStreet;
  }

  private applyStreetMaterial(component: Mesh, xDim: number, zDim: number, nestingDepth: number, faceUV: Array<Vector4>): void {
    const shorter = Math.min(xDim, zDim);
    const rotated = shorter === zDim;
    const material = new StandardMaterial('streetMaterial', this.world.getScene());
    const texture = new Texture(`./textures/city/street_depth_${nestingDepth <= this.STREET_TEXTURE_DIMENSIONS.length ? nestingDepth :
      this.STREET_TEXTURE_DIMENSIONS.length}${rotated ? '_vertical' : ''}.png`, this.world.getScene());
    material.diffuseTexture = texture;
    if (!rotated) {
      // @ts-ignore
      material.diffuseTexture.uScale = (zDim * this.getDimensionsOfTexture(nestingDepth).width) /
        (this.getDimensionsOfTexture(nestingDepth).height * shorter);
    } else {
      // @ts-ignore
      material.diffuseTexture.vScale = (xDim * this.getDimensionsOfTexture(nestingDepth).width) /
        (this.getDimensionsOfTexture(nestingDepth).height * shorter);
    }
    for (let i = 0; i < 6; i++) {
      if (i === 4) {
        faceUV[i] = new Vector4(0, 0, 1, 1);
        continue;
      }
      faceUV[i] = new Vector4(0, 0, 0, 0);
    }
    component.material = material;
  }

  private getDimensionsOfTexture(nestingDepth: number): { width: number, height: number } {
    nestingDepth--;
    nestingDepth = nestingDepth >= this.STREET_TEXTURE_DIMENSIONS.length ? this.STREET_TEXTURE_DIMENSIONS.length - 1 : nestingDepth;
    return this.STREET_TEXTURE_DIMENSIONS[nestingDepth];
  }

  public startAnimation(xPosLocal: number, yPosLocal: number, zPosLocal: number, dimension: Dimension, component: Mesh): void {
    if (dimension.xDim > dimension.zDim) {
      this.animate(dimension.xDim, component, 'x');
    } else {
      this.animate(dimension.zDim, component, 'z');
    }
  }

  private animate(dim: number, component: Mesh, targetProperty: string) {
    const startFrame = 0;
    const endFrame = 10;
    const frameRate = 3 / dim;
    const scaling = new Animation(`${targetProperty}Scaling`, `scaling.${targetProperty}`,
        frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    const keyFrames: IAnimationKey[] = [];
    keyFrames.push({frame: startFrame, value: 0});
    keyFrames.push({frame: endFrame, value: 1});
    scaling.setKeys(keyFrames);
    component.animations.push(scaling);
    this.world.getScene().beginAnimation(component, startFrame, endFrame, false);
  }
}
