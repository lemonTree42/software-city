import {Scene} from '@babylonjs/core/scene';
import {
  AbstractMesh,
  Animation,
  IAnimationKey,
  PickingInfo,
  PointerEventTypes,
  SceneLoader,
  TransformNode,
} from '@babylonjs/core';
import {Vector3} from '@babylonjs/core/Maths/math';
import {City, World} from '../../../../internal.lazy';
import {GuiViewMenu} from '../guiViewMenu';

export class TeleportationPointSelectionHelper {
  private greenArrowTransformNode: TransformNode = new TransformNode('goodMeshTransformNode');
  private redArrowTransformNode: TransformNode = new TransformNode('badMeshTransformNode');

  public static readonly VISIT_CITY_TEXT = 'Visit City';
  public static readonly LEAVE_CITY_TEXT = 'Leave City';
  public static readonly SELECT_SPAWN_TEXT = 'Select Spawn';

  constructor(
      private guiViewMenu: GuiViewMenu,
      private scene: Scene,
      private world: World,
  ) {
  }

  public loadTeleportationArrows(scene: Scene) {
    SceneLoader.ImportMesh('', 'models/', 'arrow_green.babylon', scene, (meshes) => {
      meshes[0].parent = this.greenArrowTransformNode;
      this.greenArrowTransformNode.setEnabled(false);
      this.initTeleportationArrow(meshes[0]);
    });
    SceneLoader.ImportMesh('', 'models/', 'arrow_red.babylon', scene, (meshes) => {
      meshes[0].parent = this.redArrowTransformNode;
      this.redArrowTransformNode.setEnabled(false);
      this.initTeleportationArrow(meshes[0]);
    });
  }

  public initTeleportationArrow(mesh: AbstractMesh) {
    mesh.scaling.set(0.01, 0.01, 0.01);
    mesh.position.set(0, 0, 0);
    mesh.rotation = new Vector3(-Math.PI / 2, Math.PI / 2, 0);

    const jumping = new Animation('jumping', `position.y`, 10, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    const jumpKeys: IAnimationKey[] = [];
    jumpKeys.push({frame: 0, value: 0.06});
    jumpKeys.push({frame: 10, value: 0.13});
    jumpKeys.push({frame: 20, value: 0.06});
    jumping.setKeys(jumpKeys);
    mesh.animations.push(jumping);
    this.scene.beginAnimation(mesh, 0, 40, true);

    mesh.isPickable = false;
  }

  public selectTeleportationPoint(pointerInfo): void {
    if (pointerInfo.type === PointerEventTypes.POINTERMOVE) {
      const pointerPickResult = pointerInfo.pickInfo;
      if (pointerPickResult?.hit) {
        this.handlePointHovering(pointerPickResult, pointerInfo);
      }
    } else if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
      const city = this.world!.getCity();
      const pointerPickResult = pointerInfo.pickInfo;
      if (pointerPickResult?.hit) {
        this.handlePointSelected(pointerPickResult, pointerInfo, city);
      }
      this.greenArrowTransformNode.setEnabled(false);
      this.redArrowTransformNode.setEnabled(false);
    }
  }

  private handlePointHovering(pointerPickResult: PickingInfo, pointerInfo) {
    const pickedMesh = pointerPickResult.pickedMesh;
    const pointerPoint = pointerInfo.pickInfo?.pickedPoint;
    if (pickedMesh === this.world?.getCity().getFloor() || this.world?.getCity().isMeshAStreet(pickedMesh)) {
      if (pointerPoint) {
        this.greenArrowTransformNode.setEnabled(true);
        this.greenArrowTransformNode.position.x = pointerPoint.x;
        this.greenArrowTransformNode.position.z = pointerPoint.z - 0.041;
        this.redArrowTransformNode.setEnabled(false);
      }
    } else if (this.world?.getGuiGrid().isMeshInGuiGrid(pickedMesh)) {
      this.greenArrowTransformNode.setEnabled(false);
      this.redArrowTransformNode.setEnabled(false);
    } else {
      if (pointerPoint) {
        this.redArrowTransformNode.setEnabled(true);
        this.redArrowTransformNode.position.x = pointerPoint.x;
        this.redArrowTransformNode.position.y = pointerPoint.y;
        this.redArrowTransformNode.position.z = pointerPoint.z - 0.041;
        this.greenArrowTransformNode.setEnabled(false);
      }
    }
  }

  private handlePointSelected(pointerPickResult: PickingInfo, pointerInfo, city: City) {
    const pickedMesh = pointerPickResult.pickedMesh;
    const pointerPoint = pointerInfo.pickInfo?.pickedPoint;
    if (pickedMesh === this.world?.getCity().getFloor() || this.world!.getCity().isMeshAStreet(pickedMesh)) {
      const relativeSelectionInCityX = (pointerPoint?.x || 0) / city.getScalingFactor();
      const relativeSelectionInCityZ = (pointerPoint?.z || 0) / city.getScalingFactor();
      this.world.scaleWorldToLarge();
      const absoluteTeleportationPosX = relativeSelectionInCityX * city.getScalingFactor();
      const absoluteTeleportationPosZ = relativeSelectionInCityZ * city.getScalingFactor();
      const xrHelper = this.world!.getBabylonjsController().getXrHelper();
      if (xrHelper) {
        xrHelper.baseExperience.camera.position = new Vector3(absoluteTeleportationPosX, 1.3, absoluteTeleportationPosZ);
        if (!this.world!.getGuiGrid().moveToHand()) {
          this.world!.getGuiGrid().reposition();
        }
      }
      this.guiViewMenu.teleportationPointSelectionFinished();
    }
  }

  public disableArrows(): void {
    this.greenArrowTransformNode.setEnabled(false);
    this.redArrowTransformNode.setEnabled(false);
  }
}
