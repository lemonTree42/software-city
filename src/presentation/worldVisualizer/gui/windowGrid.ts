import {GuiFramed} from './guiFramed';
import {Vector3} from '@babylonjs/core/Maths/math';
import {AbstractMesh, Nullable, Space, TransformNode} from '@babylonjs/core';
import {FreeCamera} from '@babylonjs/core/Cameras/freeCamera';
import {BabylonJsController} from '../../controller/babylonJsController';
import {GuiProgress} from './guiProgress/guiProgress';
import {GuiMenu} from './guiMenu/guiMenu';
import {GuiMetrics} from './guiMetrics/guiMetrics';
import {Building} from '../../../dataLayer/model/projectData/layout/internal';
import {IControllerInitObserver} from '../../controller/internal.lazy';
import {World} from '../internal.lazy';
import {Scene} from '@babylonjs/core/scene';
import {App} from '../../application/app';

export class WindowGrid implements IControllerInitObserver {
  private guiWindows: GuiFramed[] = [];
  private readonly windowsPerRow: number = 4;
  private transformNode: TransformNode = new TransformNode('windowGridRoot');
  private menuGui: GuiMenu;
  private positionAtHand: boolean = false;

  constructor(
      private scene: Scene,
      protected camera: FreeCamera,
      private world: World,
      protected babylonjsController: BabylonJsController,
      private appContext: App,
  ) {
    this.moveInFrontOfCamera();
    this.babylonjsController.subscribeControllerLoaded(this);
    this.menuGui = new GuiMenu(scene, this.camera, world, this.babylonjsController, appContext);
    this.menuGui.dispose();
  }

  public add(window: GuiFramed, position?: number): void {
    if (this.alreadyExists(window)) {
      return;
    }
    if (this.guiWindows.length === 0) {
      this.reposition();
    }
    if (typeof position === 'undefined') {
      this.guiWindows.push(window);
    } else {
      this.guiWindows.splice(position, 0, window);
    }
    window.draw();
    if (this.positionAtHand) {
      window.changeWindowMoveButtonUp();
    }
    const mesh = window.getMesh();
    mesh.setParent(this.transformNode);
    this.draw();
  }

  public addMenu(): void {
    this.add(this.menuGui, 0);
  }

  private alreadyExists(window: GuiFramed): boolean {
    if ((window instanceof GuiMenu) && this.containsMenu()) {
      return true;
    } else if (window instanceof GuiMetrics) {
      return this.alreadyExistsMetricsForBuilding(window.getBuilding());
    }
    return false;
  }

  public alreadyExistsMetricsForBuilding(building: Building): boolean {
    return this.guiWindows.some((w) => {
      if (w instanceof GuiMetrics) {
        return building === w.getBuilding();
      }
    });
  }

  public remove(window: GuiFramed): void {
    const index = this.guiWindows.indexOf(window);
    if (index > -1) {
      this.guiWindows.splice(index, 1);
    }
    window.dispose();
    this.draw();
  }

  public removeKind(kind: string): void {
    const window = this.getKind(kind);
    if (window) {
      this.remove(window);
    }
  }

  public getKind(kind: string) {
    return this.guiWindows.find((window) => window.constructor.name === kind);
  }

  public reset(): void {
    this.guiWindows.forEach((window) => window.dispose());
    this.guiWindows = [];
    this.draw();
  }

  public draw(): void {
    const windowWidth = this.guiWindows.length > 4 ? 4 : this.guiWindows.length;
    for (let i=0; i<this.guiWindows.length; i++) {
      const mesh = this.guiWindows[i].getMesh();
      mesh.rotation = new Vector3(0, 0, 0);
      mesh.position = new Vector3(0, 0, 0);
      mesh.position = new Vector3(i%this.windowsPerRow - windowWidth/2 + 0.5,
          Math.floor(this.guiWindows.length/this.windowsPerRow - 0.1) - Math.floor(i/this.windowsPerRow), 0);
      mesh.scaling = new Vector3(0.9, 0.9, 0.9);
    }
  }

  public isShowingProgress(): boolean {
    return this.guiWindows.some((window) => window instanceof GuiProgress);
  }

  public containsMenu(): boolean {
    return this.guiWindows.some((window) => window instanceof GuiMenu);
  }

  public moveToHand(): boolean {
    const controller = this.babylonjsController.getControllerLeftHandMesh();
    if (!controller) return false;
    this.positionAtHand = true;
    this.resetPositioning();
    this.transformNode.rotation.x = 0.5;
    this.transformNode.scaling = new Vector3(0.3, 0.3, 0.3);
    this.transformNode.translate(new Vector3(0, 0.7, 0.5), 1, Space.LOCAL);
    this.transformNode.parent = controller;
    this.transformNode.setEnabled(true);
    this.guiWindows.forEach((window) => window.changeWindowMoveButtonUp());
    return true;
  }

  public moveInFrontOfCamera(): void {
    this.positionAtHand = false;
    this.resetPositioning();
    this.transformNode.setEnabled(true);
    this.transformNode.position = this.babylonjsController.getXrHelper()?.baseExperience.camera.position.clone()
        .addInPlace(new Vector3(0, 0, 1.5)) || new Vector3(0, 0, 0);
    this.transformNode.setPivotPoint(new Vector3(0, 0, -1.5));
    this.transformNode.rotation.y = this.babylonjsController.getXrHelper()?.baseExperience.camera.rotationQuaternion.toEulerAngles().y || 0;
    this.guiWindows.forEach((window) => window.changeWindowMoveButtonDown());
  }

  public onControllerLoaded(left: AbstractMesh | undefined, right: AbstractMesh | undefined) {
    if (this.positionAtHand) {
      this.reset();
      this.menuGui.dispose();
      this.menuGui = new GuiMenu(this.scene, this.camera, this.world, this.babylonjsController, this.appContext);
    }
    this.reposition();
  }

  public reposition() {
    if (this.positionAtHand) {
      this.moveToHand();
    } else {
      this.moveInFrontOfCamera();
    }
  }

  private resetPositioning() {
    this.transformNode.position = new Vector3(0, 0, 0);
    this.transformNode.rotation = new Vector3(0, 0, 0);
    this.transformNode.scaling = new Vector3(1, 1, 1);
    this.transformNode.setPivotPoint(new Vector3(0, 0, 0));
    this.transformNode.parent = null;
  }

  public detachWindowsFromController(): void {
    this.transformNode.parent = null;
  }

  public getWindowForBuilding(building: Building): GuiFramed | undefined {
    return this.guiWindows.find((window) => {
      if (window instanceof GuiMetrics) {
        return building === window.getBuilding();
      }
    });
  }

  public isMeshInGuiGrid(mesh: Nullable<AbstractMesh>): boolean {
    if (mesh) {
      return this.guiWindows.some((window) => window.getMesh()===mesh);
    }
    return false;
  }

  public getTransformationNode(): TransformNode {
    return this.transformNode;
  }
}
