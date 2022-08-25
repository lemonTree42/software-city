import {Position} from '../../../../../dataLayer/model/projectData/layout/position';
import {Color3, Vector3} from '@babylonjs/core/Maths/math';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {DynamicTexture, StandardMaterial, Vector4} from '@babylonjs/core';
import {World} from '../../../world';
import {DataContext} from '../../../../application/dataContext';

export class SignRenderer {
  constructor(
      private world: World,
      private dataContext: DataContext,
  ) {
  }

  public renderSign(name: string, position: Position, frontYardIndex: number, xDim: number, zDim: number, rotated: boolean): void {
    const {signPosition, signRotation} = this.getPositionAndRotation(frontYardIndex, rotated, position, xDim, zDim);
    const projectWeight = this.getProjectWeight();
    const nameScaleFactor = (name.length/11+1/3);
    const signHeightWithStick = projectWeight*(-29/972000)+0.03783539;
    const signWidth = (signHeightWithStick/1)*nameScaleFactor;
    const signHeight = signHeightWithStick/3.5;
    const signThickness = signHeightWithStick/20;
    const signColor = new Color3(255/255, 225/255, 199/255);
    const signStick = this.createSignStick(signHeightWithStick, signThickness, signPosition, signColor);
    const signPanel = this.createSignPanel(nameScaleFactor, name, signColor, signHeight, signThickness, signWidth,
        signPosition, signHeightWithStick, signRotation);
    signStick.parent = this.world.getCity().getCityTransformNode();
    signPanel.parent = this.world.getCity().getCityTransformNode();
    this.world.getCity().addObjectToMeshArray(signStick);
    this.world.getCity().addObjectToMeshArray(signPanel);
  }

  private createSignPanel(nameScaleFactor: number, name: string, signColor: Color3, signHeight: number, signThickness: number, signWidth: number,
      signPosition: Position, signHeightWithStick: number, signRotation: Vector3) {
    const dynamicTexture = new DynamicTexture('text', {
      width: 1000 * nameScaleFactor,
      height: 250,
    }, this.world.getScene(), false);

    const mat = new StandardMaterial('mat', this.world.getScene());
    mat.diffuseTexture = dynamicTexture;
    dynamicTexture.drawText(name, null, null, '150px Courier', 'black', 'white');

    const faceUV = new Array(6);
    const faceColors = new Array(6);

    for (let i = 0; i < 6; i++) {
      faceUV[i] = new Vector4(0, 0, 0, 0);
      faceColors[i] = signColor;
    }
    faceUV[4] = new Vector4(0, 0, 1, 1);
    const box = MeshBuilder.CreateBox('box', {
      faceUV: faceUV,
      faceColors: faceColors,
      width: signHeight,
      height: signThickness,
      depth: signWidth,
    });
    box.position = new Vector3(signPosition.X - this.world.getCity().getCityWidth() / 2,
        signHeightWithStick + signHeight / 2, signPosition.Y - this.world.getCity().getCityWidth() / 2);
    box.rotation = signRotation;
    box.material = mat;
    return box;
  }

  private createSignStick(signHeightWithStick: number, signThickness: number, signPosition, signColor: Color3) {
    const cylinder = MeshBuilder.CreateCylinder('cylinder', {
      height: signHeightWithStick,
      diameter: signThickness - 0.0001,
    });
    cylinder.position = new Vector3(signPosition.X - this.world.getCity().getCityWidth() / 2,
        signHeightWithStick / 2, signPosition.Y - this.world.getCity().getCityWidth() / 2);
    const material = new StandardMaterial('stick', this.world.getScene());
    material.diffuseColor = signColor;
    cylinder.material = material;
    return cylinder;
  }

  private getProjectWeight() {
    const projectWeight = this.dataContext.getProcessedProject().getWeight();
    return projectWeight > 1000 ? 1000 : projectWeight;
  }

  private getPositionAndRotation(frontYardIndex: number, rotated: boolean, position: Position, xDim: number, zDim: number) {
    let signPosition;
    let signRotation;
    if (!(frontYardIndex % 2)) {
      signPosition = new Position(rotated ? position.X + xDim / 2 : position.X, rotated ? position.Y : position.Y + zDim / 2);
      signRotation = new Vector3(0, rotated ? Math.PI / 2 : Math.PI, -Math.PI / 2);
    } else {
      signPosition = new Position(rotated ? position.X + xDim / 2 : position.X + xDim, rotated ? position.Y + zDim : position.Y + zDim / 2);
      signRotation = new Vector3(0, rotated ? -Math.PI / 2 : 0, -Math.PI / 2);
    }
    return {signPosition, signRotation};
  }
}
