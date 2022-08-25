import {Engine} from '@babylonjs/core/Engines/engine';
import '@babylonjs/core/Helpers/sceneHelpers';
import {
  AbstractMesh, PointerEventTypes,
  WebXRAbstractMotionController,
  WebXRDefaultExperience, WebXRFeatureName,
  WebXRInputSource,
  WebXRState,
} from '@babylonjs/core';
import {IControllerInitObserver, IOnAboutToExitVr} from './internal.lazy';
import {GuiProgress, World} from '../worldVisualizer/internal.lazy';
import {App} from '../application/app';
import {CommonStateStatus} from '../application/states/stateStatus';
import '@babylonjs/loaders/glTF';
import {WebXrError} from '../../utils/errorhandling/Errors';

export class BabylonJsController {
  private readonly canvas: HTMLCanvasElement;
  private readonly engine: Engine;
  private readonly world: World;
  private vrStarted: boolean = false;
  private xrHelper?: WebXRDefaultExperience;
  private controllerLeftHand: WebXRAbstractMotionController | undefined;
  private controllerRightHand: WebXRAbstractMotionController | undefined;
  private controllerLeftHandMesh: AbstractMesh | undefined;
  private controllerRightHandMesh: AbstractMesh | undefined;
  private controllerLoadedSubscribers: IControllerInitObserver[] = [];
  private exitVrSubscribers: IOnAboutToExitVr[] = [];

  constructor(private appContext: App) {
    this.canvas = <HTMLCanvasElement>document.getElementById('renderCanvas');
    this.engine = new Engine(this.canvas, true, {stencil: true});
    this.world = new World(this.appContext, this);
    this.initPointerObserver(this.world);
  }

  public async onEnterVrClicked(): Promise<void> {
    if (!this.vrStarted) {
      const scene = this.world.getScene();
      this.engine.runRenderLoop(() => {
        scene.render();
      });
      this.xrHelper = this.xrHelper || await WebXRDefaultExperience.CreateAsync(this.world.getScene(), {
        floorMeshes: [this.world.getCity().getFloor()],
      });
      this.vrStarted = true;
      this.xrHelper!.input.onControllerAddedObservable.add((controller) => {
        controller.onMotionControllerInitObservable.add((motionController) => {
          this.initButtonControls(motionController, controller);
          this.notifyControllerLoadedSubscriber();
        });
      });
      this.xrHelper.baseExperience.onStateChangedObservable.add((state) => {
        if (state === WebXRState.IN_XR) {
          this.world.getGuiGrid().reposition();
        }
      });
      this.world.getBabylonjsController().enableTeleportation(false);
    }
    this.clickBabylonJsVrButton();
  }

  public async onExitVrClicked(): Promise<void> {
    this.world.getGuiGrid().detachWindowsFromController();
    this.notifyOnAboutToExitVrSubscriber();
    this.clickBabylonJsVrButton();
  }

  private clickBabylonJsVrButton() {
    const button = <HTMLButtonElement>document.querySelector('#vrpage button');
    if (button) {
      button.click();
    } else {
      throw new WebXrError('Unable to start VR experience. Make sure your WebXR device supports the "immersive-vr" mode.');
    }
  }

  public async onAbortClicked(): Promise<void> {
    this.appContext.getCurrentState().finish(CommonStateStatus.cancel);
  }

  public vibrateControllerLeftHand(strength: number, duration: number): void {
    this.controllerLeftHand?.pulse(strength, duration);
  }

  public vibrateControllerRightHand(strength: number, duration: number): void {
    this.controllerRightHand?.pulse(strength, duration);
  }

  public subscribeControllerLoaded(subscriber: IControllerInitObserver): void {
    this.controllerLoadedSubscribers.push(subscriber);
  }

  private notifyControllerLoadedSubscriber(): void {
    for (const subscriber of this.controllerLoadedSubscribers) {
      subscriber.onControllerLoaded(this.controllerLeftHandMesh, this.controllerRightHandMesh);
    }
  }

  public subscribeOnAboutToExitVr(subscriber: IOnAboutToExitVr): void {
    this.exitVrSubscribers.push(subscriber);
  }

  private notifyOnAboutToExitVrSubscriber(): void {
    for (const subscriber of this.exitVrSubscribers) {
      subscriber.onAboutToExitVr();
    }
  }

  public updateDataRetrievalStatus(files: number, lines: number): void {
    (<GuiProgress | undefined> this.world.getGuiGrid().getKind(GuiProgress.name))?.updateDataFetchStatus(files, lines);
  }

  public enableTeleportation(shouldEnable: boolean): void {
    if (shouldEnable) {
      this.xrHelper?.baseExperience.featuresManager.enableFeature(WebXRFeatureName.TELEPORTATION, 'stable', {
        xrInput: this.xrHelper?.input,
        floorMeshes: [this.world.getCity().getFloor()],
      });
    } else {
      this.xrHelper?.baseExperience.featuresManager.enableFeature(WebXRFeatureName.TELEPORTATION, 'stable', {
        xrInput: this.xrHelper?.input,
        floorMeshes: [],
      });
    }
  }

  private initPointerObserver(world: World): void {
    world.getScene().onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
        const pickResult = pointerInfo.pickInfo;
        if (pickResult?.hit) {
          this.world.getCity().handleMeshSelected(pickResult);
        }
      }
    });
  }

  private initButtonControls(motionController: WebXRAbstractMotionController, controller: WebXRInputSource) {
    if (motionController.handedness === 'left') {
      this.initButtonLeftController(motionController, controller);
    } else if (motionController.handedness === 'right') {
      this.initButtonRightController(motionController, controller);
    }
  }

  private initButtonRightController(motionController: WebXRAbstractMotionController, controller: WebXRInputSource) {
    this.controllerRightHand = motionController;
    this.controllerRightHandMesh = controller.grip;
    const xrIds = motionController.getComponentIds();
    const triggerComponent = motionController.getComponent(xrIds[1]);
    triggerComponent && triggerComponent.onButtonStateChangedObservable.add(() => {
      if (triggerComponent.pressed) {
        this.world.getCity().scaleCity(1.1);
      }
    });
    const bButton = motionController.getComponent(xrIds[4]);
    bButton && bButton.onButtonStateChangedObservable.add(() => {
      if (bButton.pressed) {
        this.world.getCity().rotateCity(-0.1);
      }
    });
    const aButton = motionController.getComponent(xrIds[3]);
    aButton && aButton.onButtonStateChangedObservable.add(() => {
      if (aButton.pressed) {
        this.world.toggleMenuGui();
      }
    });
  }

  private initButtonLeftController(motionController: WebXRAbstractMotionController, controller: WebXRInputSource) {
    this.controllerLeftHand = motionController;
    this.controllerLeftHandMesh = controller.grip;
    const xrIds = motionController.getComponentIds();
    const triggerComponent = motionController.getComponent(xrIds[1]);
    triggerComponent && triggerComponent.onButtonStateChangedObservable.add(() => {
      if (triggerComponent.pressed) {
        this.world.getCity().scaleCity(0.9);
      }
    });
    const bButton = motionController.getComponent(xrIds[4]);
    bButton && bButton.onButtonStateChangedObservable.add(() => {
      if (bButton.pressed) {
        this.world.getCity().rotateCity(0.1);
      }
    });
  }

  public getWorld(): World {
    return this.world;
  }

  public getEngine(): Engine {
    return this.engine;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getXrHelper(): WebXRDefaultExperience | undefined {
    return this.xrHelper;
  }

  public getControllerLeftHandMesh(): AbstractMesh | undefined {
    return this.controllerLeftHandMesh;
  }

  public getControllerRightHandMesh(): AbstractMesh | undefined {
    return this.controllerRightHandMesh;
  }
}
