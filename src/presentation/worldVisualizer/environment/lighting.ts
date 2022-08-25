import {
  DirectionalLight, GlowLayer,
  HemisphericLight,
  ShadowGenerator,
  Space,
  StandardMaterial,
  TransformNode,
} from '@babylonjs/core';
import {Scene} from '@babylonjs/core/scene';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {Axis, Color3, Vector3} from '@babylonjs/core/Maths/math';
import {TimeObserver} from './time';
import {World} from '../internal.lazy';

export class Lighting implements TimeObserver {
  private readonly sunLightSmall: DirectionalLight;
  private readonly sunLightLarge: DirectionalLight;
  private readonly shadowGeneratorSmall: ShadowGenerator;
  private readonly shadowGeneratorLarge: ShadowGenerator;
  private readonly sunTransformNode: TransformNode;
  private readonly sunMaterial: StandardMaterial;
  private readonly sun: Mesh;

  constructor(
      private scene: Scene,
      private world: World,
  ) {
    this.sunTransformNode = new TransformNode('sunRootNode');
    this.sunMaterial = new StandardMaterial('light', this.scene);
    this.sun = this.createSun(this.scene);
    this.sunLightSmall = this.createLighting(this.scene);
    this.sunLightLarge = this.createLighting(this.scene);
    this.shadowGeneratorSmall = this.createShadowsForSmallScale();
    this.shadowGeneratorLarge = this.createShadowsForLargeScale();
    this.enableSmallSunLight();
    this.sunLightSmall.shadowEnabled = false;
    this.sunLightLarge.shadowEnabled = false;
    this.createAmbientLight(this.scene);
    world.getTime().subscribeToTimeChange(this);
  }

  private createSun(scene: Scene): Mesh {
    const sun = MeshBuilder.CreateSphere('sphere', {diameter: 0.2}, scene);
    sun.position = new Vector3(0, 5, 0);
    sun.material = this.sunMaterial;
    sun.parent = this.sunTransformNode;
    this.sunTransformNode.rotate(Axis.Z, this.convertHoursToRadians(this.world.getTime().getCurrentTime()), Space.WORLD);
    return sun;
  }

  private createLighting(scene: Scene): DirectionalLight {
    const light = new DirectionalLight('dir1', new Vector3(0, -1, 0), scene);
    light.parent = this.sunTransformNode;
    light.position = this.sun.position;
    light.diffuse = new Color3(1, 1, 1);
    light.specular = new Color3(1, 1, 1);
    return light;
  }

  private createAmbientLight(scene: Scene) {
    const nightAmbientLight = new HemisphericLight('hemisphericLight', new Vector3(0, 4, 0), scene);
    nightAmbientLight.intensity = 0.4;

    const gl = new GlowLayer('glow', scene);
    gl.intensity = 0.5;
  }

  public scaleSunToLarge(): void {
    const scalingFactor = 100;
    this.sunTransformNode.scaling = new Vector3(scalingFactor, scalingFactor, scalingFactor);
    this.enableLargeSunLight();
  }

  public scaleSunToSmall(): void {
    this.sunTransformNode.scaling = new Vector3(1, 1, 1);
    this.enableSmallSunLight();
  }

  public enableSmallSunLight(): void {
    this.sunLightSmall.setEnabled(true);
    this.sunLightLarge.setEnabled(false);
  }

  public enableLargeSunLight(): void {
    this.sunLightLarge.setEnabled(true);
    this.sunLightSmall.setEnabled(false);
  }

  public createShadowsForSmallScale(): ShadowGenerator {
    const shadowGeneratorSmall = new ShadowGenerator(Math.pow(2, 10), this.sunLightSmall);
    shadowGeneratorSmall.bias = 0.003;
    shadowGeneratorSmall.normalBias = 0.0001;
    this.sunLightSmall.shadowMaxZ = 8;
    this.sunLightSmall.shadowMinZ = 1;
    shadowGeneratorSmall.useContactHardeningShadow = true;
    shadowGeneratorSmall.contactHardeningLightSizeUVRatio = 0.12;
    shadowGeneratorSmall.setDarkness(0.5);
    return shadowGeneratorSmall;
  }

  public createShadowsForLargeScale(): ShadowGenerator {
    const shadowGeneratorLarge = new ShadowGenerator(Math.pow(2, 10), this.sunLightLarge);
    shadowGeneratorLarge.bias = 0.01;
    shadowGeneratorLarge.normalBias = 0.004;
    this.sunLightLarge.shadowMaxZ = 560;
    this.sunLightLarge.shadowMinZ = 440;
    shadowGeneratorLarge.useContactHardeningShadow = true;
    shadowGeneratorLarge.contactHardeningLightSizeUVRatio = 0.03;
    shadowGeneratorLarge.setDarkness(0.5);
    return shadowGeneratorLarge;
  }

  public enableShadows(status: boolean): void {
    this.sunLightSmall.shadowEnabled = status;
    this.sunLightLarge.shadowEnabled = status;
  }

  public areShadowsEndabled(): boolean {
    return this.sunLightSmall.shadowEnabled;
  }

  public updateTime(time: number, timeString: string): void {
    this.sunTransformNode.rotation = new Vector3(0, 0, 0);
    this.sunTransformNode.rotate(Axis.Z, this.convertHoursToRadians(time), Space.WORLD);
    this.setAmbientLight(time);
    this.setSunColor(time);
    this.setSunLightsIntensity(time);
    this.world.getSky().setSkyboxTexture(time);
  }

  private convertHoursToRadians(hours: number): number {
    return (hours + 12) * Math.PI * 2 / 24;
  }

  public getShadowGeneratorSmallScale(): ShadowGenerator {
    return this.shadowGeneratorSmall!;
  }

  public getShadowGeneratorLargeScale(): ShadowGenerator {
    return this.shadowGeneratorLarge!;
  }

  private setSunColor(hours: number): void {
    if (hours < 6) {
      this.sunMaterial.emissiveColor = new Color3(1, 0, 0);
    } else if (hours < 8) {
      this.sunMaterial.emissiveColor = new Color3(1, (1/2)*hours-3, (68*hours-408)/255);
    } else if (hours < 16) {
      this.sunMaterial.emissiveColor = new Color3(1, 1, 136/255);
    } else if (hours < 18) {
      this.sunMaterial.emissiveColor = new Color3(1, -(1/2)*hours+9, (-68*hours+1224)/255);
    } else {
      this.sunMaterial.emissiveColor = new Color3(1, 0, 0);
    }
  }

  private setSunLightsIntensity(hours: number): void {
    if (hours < 6 || hours >= 18) {
      this.sunLightSmall.intensity = 0;
      this.sunLightLarge.intensity = 0;
    } else if (hours < 6.5) {
      this.sunLightSmall.intensity = 1.6 * hours - 9.6;
      this.sunLightLarge.intensity = 1.6 * hours - 9.6;
    } else if (hours < 17.5) {
      this.sunLightSmall.intensity = 0.9;
      this.sunLightLarge.intensity = 0.9;
    } else if (hours < 18) {
      this.sunLightSmall.intensity = -1.6 * hours + 28.8;
      this.sunLightLarge.intensity = -1.6 * hours + 28.8;
    }
  }

  private setAmbientLight(hours: number): void {
    if (hours < 8) {
      const green = 77.5*hours-365;
      const blue = 93*hours-489;
      this.sunLightSmall.diffuse = new Color3(1, green / 255, blue / 255);
      this.sunLightLarge.diffuse = new Color3(1, green / 255, blue / 255);
      this.sunLightSmall.specular = new Color3(1, green / 255, blue / 255);
      this.sunLightLarge.specular = new Color3(1, green / 255, blue / 255);
    } else if (hours < 16) {
      this.sunLightSmall.diffuse = new Color3(1, 1, 1);
      this.sunLightLarge.diffuse = new Color3(1, 1, 1);
      this.sunLightSmall.specular = new Color3(1, 1, 1);
      this.sunLightLarge.specular = new Color3(1, 1, 1);
    } else if (hours < 18) {
      const green = -77.5*hours+1495;
      const blue = -93*hours+1743;
      this.sunLightSmall.diffuse = new Color3(1, green / 255, blue / 255);
      this.sunLightLarge.diffuse = new Color3(1, green / 255, blue / 255);
      this.sunLightSmall.specular = new Color3(1, green / 255, blue / 255);
      this.sunLightLarge.specular = new Color3(1, green / 255, blue / 255);
    }
  }
}
