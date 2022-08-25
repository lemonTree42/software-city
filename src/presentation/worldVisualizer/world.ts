import {Scene} from '@babylonjs/core/scene';
import {FreeCamera} from '@babylonjs/core/Cameras/freeCamera';
import {Vector3} from '@babylonjs/core/Maths/math';
import '@babylonjs/core/Materials/Node/nodeMaterial';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {
  GroundMesh,
  StandardMaterial,
  Texture,
} from '@babylonjs/core';
import {City, GuiMenu, GuiProgress, WindowGrid} from './internal.lazy';
import {BabylonJsController} from '../controller/babylonJsController';
import {App} from '../application/app';
import {StateChangeObserver} from '../application/appObserver';
import {Lighting, Time, Sky} from './environment/internal.lazy';

export class World implements StateChangeObserver {
  private readonly scene: Scene;
  private readonly camera: FreeCamera;
  private readonly guiGrid: WindowGrid;
  private readonly city: City;
  private readonly time: Time;
  private readonly sky: Sky;
  private readonly lighting: Lighting;
  private landscape?: GroundMesh;

  constructor(
    private appContext: App,
    private babylonjsController: BabylonJsController,
  ) {
    this.time = new Time();
    this.scene = new Scene(babylonjsController.getEngine());
    this.lighting = new Lighting(this.scene, this);
    this.camera = this.createCamera(this.scene, babylonjsController.getCanvas());
    this.city = new City(this.scene, this, appContext);
    this.guiGrid = new WindowGrid(this.scene, this.camera, this, this.babylonjsController, this.appContext);
    const progressGui = new GuiProgress(this.scene, this.camera, this, this.babylonjsController, this.appContext);
    this.guiGrid.add(progressGui);
    this.createGround(this.scene);
    appContext.subscribeToStateChange(this);
    this.sky = new Sky(this.scene, this, appContext);
    this.time.set(new Date().getHours()+new Date().getMinutes()/60);
  }

  private createGround(scene: Scene): void {
    const options = {
      width: 5,
      height: 5,
      subdivisions: 200,
      minHeight: 0,
      maxHeight: 0.6,
    };
    this.landscape = MeshBuilder.CreateGroundFromHeightMap('ground', 'textures/mountains.png', options);
    this.landscape.position.set(0, -0.02, 0);
    const groundMaterial = new StandardMaterial('ground', scene);
    groundMaterial.diffuseTexture = new Texture('./textures/grass3.png', scene);
    this.landscape.material = groundMaterial;
  }

  public scaleLandscape(factor: number): void {
    this.landscape && (this.landscape.scaling = new Vector3(factor, factor, factor));
  }

  private createCamera(scene: Scene, canvas: HTMLCanvasElement): FreeCamera {
    const camera = new FreeCamera('camera1', new Vector3(0, 1.3, -1), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    return camera;
  }

  public scaleWorldToLarge(): void {
    this.city.scaleCityToLarge();
    this.lighting.scaleSunToLarge();
    this.scaleLandscape(City.UPPERBOUND_LARGESCALE_CITY);
    this.babylonjsController.enableTeleportation(true);
  }

  public scaleWorldToSmall(): void {
    this.city.scaleCityToSmall();
    this.lighting.scaleSunToSmall();
    this.scaleLandscape(City.SMALLSCALE_CITY_DEFAULT_SIZE);
    this.babylonjsController.enableTeleportation(false);
    this.babylonjsController.getXrHelper()!.baseExperience.camera.setTransformationFromNonVRCamera(this.camera);
    this.babylonjsController.getXrHelper()!.baseExperience.camera.position = new Vector3(0, 0, -1);
    setTimeout(() => this.getGuiGrid().reposition(), 400);
  }

  public showMenuGui(shouldShow: boolean): void {
    if (shouldShow) {
      this.guiGrid.addMenu();
    } else {
      this.guiGrid.removeKind(GuiMenu.name);
    }
  }

  public toggleMenuGui(): void {
    this.showMenuGui(!this.guiGrid.containsMenu());
  }

  public updateState(newState: string, newStateIndex: number): void {
    if (newStateIndex === 5) {
      setTimeout(() => {
        this.guiGrid.removeKind(GuiProgress.name);
        this.showMenuGui(true);
      }, 1000);
    } else {
      if (!this.guiGrid.isShowingProgress()) {
        this.guiGrid.reset();
        this.guiGrid.add(new GuiProgress(this.scene, this.camera, this, this.babylonjsController, this.appContext));
      }
    }
  }

  public getScene(): Scene {
    return this.scene;
  }

  public getCamera(): FreeCamera {
    return this.camera;
  }

  public getCity(): City {
    return this.city;
  }

  public removeCity(): void {
    this.city.dispose();
  }

  public getGuiGrid(): WindowGrid {
    return this.guiGrid;
  }

  public getTime(): Time {
    return this.time;
  }

  public getSky(): Sky {
    return this.sky;
  }

  public getLighting(): Lighting {
    return this.lighting;
  }

  public getBabylonjsController(): BabylonJsController {
    return this.babylonjsController;
  }
}
