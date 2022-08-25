import {CubeTexture, StandardMaterial, Texture} from '@babylonjs/core';
import {Scene} from '@babylonjs/core/scene';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {Color3} from '@babylonjs/core/Maths/math';
import {App} from '../../application/app';
import {World} from '../internal.lazy';

export class Sky {
  private readonly IMAGES_PER_DAYTIME: number = 2;
  private readonly skyboxMaterial: StandardMaterial;
  private readonly daySkyboxTexture: CubeTexture[] = [];
  private readonly duskSkyboxTexture: CubeTexture[] = [];
  private readonly nightSkyboxTexture: CubeTexture[] = [];
  private cloudIndex: number = 0;

  constructor(
        private scene: Scene,
        private world: World,
        private appContext: App,
  ) {
    this.skyboxMaterial = new StandardMaterial('skyBox', this.scene);
    for (let i=0; i<this.IMAGES_PER_DAYTIME; i++) {
      this.daySkyboxTexture.push(new CubeTexture(`./textures/skybox/day/variant${i}/skybox`, this.scene));
    }
    for (let i=0; i<this.IMAGES_PER_DAYTIME; i++) {
      this.duskSkyboxTexture.push(new CubeTexture('./textures/skybox/dusk/variant1/skybox', this.scene));
    }
    for (let i=0; i<this.IMAGES_PER_DAYTIME; i++) {
      this.nightSkyboxTexture.push(new CubeTexture('./textures/skybox/night/variant2/skybox', this.scene));
    }
    this.createSkybox(scene);
  }

  private createSkybox(scene: Scene): void {
    const skybox = MeshBuilder.CreateBox('skyBox', {size: 1000.0}, scene);
    this.skyboxMaterial.backFaceCulling = false;
    this.skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
    this.skyboxMaterial.specularColor = new Color3(0, 0, 0);
    this.setSkyboxTexture(this.world.getTime().getCurrentTime());
    skybox.material = this.skyboxMaterial;
  }

  public setSkyboxTexture(hours: number): void {
    if (hours < 6) {
      this.skyboxMaterial.reflectionTexture = this.nightSkyboxTexture[this.cloudIndex];
    } else if (hours < 8) {
      this.skyboxMaterial.reflectionTexture = this.duskSkyboxTexture[this.cloudIndex];
    } else if (hours < 16) {
      this.skyboxMaterial.reflectionTexture = this.daySkyboxTexture[this.cloudIndex];
    } else if (hours < 18) {
      this.skyboxMaterial.reflectionTexture = this.duskSkyboxTexture[this.cloudIndex];
    } else {
      this.skyboxMaterial.reflectionTexture = this.nightSkyboxTexture[this.cloudIndex];
    }
    this.skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  }

  public setCloudIndex(): void {
    let averageLineWidth = 0;
    try {
      averageLineWidth = this.appContext.getDataContext().getProcessedProject().getAverageLineWidth();
    } catch (e: any) {}
    const lineWidthThreshold = 60;
    let index = Math.floor(averageLineWidth/lineWidthThreshold);
    index = index>=this.IMAGES_PER_DAYTIME?this.IMAGES_PER_DAYTIME-1:index;
    if (this.cloudIndex === index) return;
    this.cloudIndex = index;
    this.setSkyboxTexture(this.world.getTime().getCurrentTime());
  }
}
