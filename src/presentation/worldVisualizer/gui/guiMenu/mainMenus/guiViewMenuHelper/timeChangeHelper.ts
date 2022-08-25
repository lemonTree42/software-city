import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {AbstractMesh, Color4, NoiseProceduralTexture, ParticleSystem, StandardMaterial, Texture} from '@babylonjs/core';
import {Scene} from '@babylonjs/core/scene';
import {Vector3} from '@babylonjs/core/Maths/math';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {World} from '../../../../world';
import {IControllerInitObserver} from '../../../../../controller/interfaces/iControllerLoadedObserver';
import {IOnAboutToExitVr} from '../../../../../controller/interfaces/iOnAboutToExitVr';

export class TimeChangeHelper implements IControllerInitObserver, IOnAboutToExitVr {
  private readonly TIME_SPELL_MESH_COUNT = 4;
  private timeSpellMeshes: Mesh[] = [];
  private inTimeEditMode: boolean = false;

  constructor(
      private world: World,
      private finishTimeEditingCallback: Function,
  ) {
    const babylonJsController = world.getBabylonjsController();
    babylonJsController.subscribeOnAboutToExitVr(this);
    babylonJsController.subscribeControllerLoaded(this);
  }

  public readControllerRotation(previousRotation: number, zOffset: number, waitingCounter: number): void {
    const controller = this.world?.getBabylonjsController().getControllerRightHandMesh();
    if (this.inTimeEditMode && controller) {
      this.createTimeSpellMeshesIfNecessary(controller);
      this.timeSpellMeshes.forEach((mesh) => {
        mesh.setEnabled(true);
        mesh.isPickable = false;
      });

      const controllerRotation = (controller.rotationQuaternion?.toEulerAngles().z||0);
      const rotation = 1.6*controllerRotation;
      const deltaRotation = previousRotation-rotation;
      this.rotateTimeSpellMeshes(deltaRotation, controller);
      const {newZOffset, newWaitingCounter} = this.offsetTimeSpellMeshes(deltaRotation, zOffset, waitingCounter);

      this.updateWorldTime(deltaRotation);
      setTimeout(() => this.readControllerRotation(rotation, newZOffset, newWaitingCounter), 25);
    } else {
      this.timeSpellMeshes.forEach((mesh) => mesh.setEnabled(false));
    }
  }

  private updateWorldTime(deltaRotation: number) {
    const deltaHours = -this.convertRadiansToHours(deltaRotation);
    if (Math.abs(deltaHours) < 10) {
      this.world?.getTime().increase(deltaHours);
    }
  }

  public onControllerLoaded(left: AbstractMesh | undefined, right: AbstractMesh | undefined): void {
    if (right && this.timeSpellMeshes[0]) {
      this.timeSpellMeshes.forEach((mesh) => {
        mesh.parent = right;
      });
    }
  }

  onAboutToExitVr(): void {
    this.finishTimeEditingCallback();
    this.timeSpellMeshes.forEach((mesh) => mesh.parent = null);
  }

  private createTimeSpellMeshesIfNecessary(controller: AbstractMesh): void {
    if (!this.timeSpellMeshes[0]) {
      const scene = this.world?.getScene();
      this.createTimeSpellMeshes(scene, controller);
      if (scene) {
        this.createTimeSpellMaterial(scene);
        this.startTimeSpellParticles(scene);
      }
    }
  }

  private offsetTimeSpellMeshes(deltaRotation: number, zOffset: number, waitingCounter: number): {newZOffset: number, newWaitingCounter: number} {
    const offsetChangeAnimationSpeed = 0.002;
    if (Math.abs(deltaRotation) > 0.07) {
      this.world?.getBabylonjsController().vibrateControllerRightHand(0.4, 100);
      zOffset += Math.abs(0.05 * deltaRotation) > zOffset ? offsetChangeAnimationSpeed : 0;
      this.setTimeSpellMeshOffset(zOffset);
      waitingCounter = 2;
    } else {
      if (waitingCounter === 0) {
        zOffset -= (zOffset - offsetChangeAnimationSpeed) > 0 ? offsetChangeAnimationSpeed : zOffset;
        this.setTimeSpellMeshOffset(zOffset);
      } else {
        waitingCounter--;
      }
    }
    return {newZOffset: zOffset, newWaitingCounter: waitingCounter};
  }

  private rotateTimeSpellMeshes(deltaRotation: number, controller: AbstractMesh) {
    this.timeSpellMeshes[0] && (this.timeSpellMeshes[0].rotation.z += 0.01 - deltaRotation);
    this.timeSpellMeshes[1] && (this.timeSpellMeshes[1].rotation.z -= 0.02 + deltaRotation);
    this.timeSpellMeshes[2] && (this.timeSpellMeshes[2].rotation.z = -(controller?.rotationQuaternion?.toEulerAngles().z || 0));
    this.timeSpellMeshes[3] && (this.timeSpellMeshes[3].rotation.z += 1.5 * deltaRotation);
  }

  private setTimeSpellMeshOffset(zOffset: number) {
    this.timeSpellMeshes[0] && (this.timeSpellMeshes[0].position.z = 0.13 + 2.7 * zOffset);
    this.timeSpellMeshes[1] && (this.timeSpellMeshes[1].position.z = 0.127 + 0.7 * zOffset);
    this.timeSpellMeshes[2] && (this.timeSpellMeshes[2].position.z = 0.117 + 0.3 * zOffset);
    this.timeSpellMeshes[3] && (this.timeSpellMeshes[3].position.z = 0.104 + 0 * zOffset);
  }

  private createTimeSpellMaterial(scene: Scene) {
    for (let i=0; i<this.TIME_SPELL_MESH_COUNT; i++) {
      const material = new StandardMaterial(`timeSpellMaterial${i}`, scene);
      const texture = new Texture(`./textures/gui/timeSpell/timeSpell${i + 1}.png`, scene);
      material.opacityTexture = texture;
      material.emissiveTexture = texture;
      this.timeSpellMeshes[i].material = material;
    }
  }

  private createTimeSpellMeshes(scene: Scene | undefined, controller: AbstractMesh) {
    for (let i=0; i<this.TIME_SPELL_MESH_COUNT; i++) {
      this.timeSpellMeshes[i] = MeshBuilder.CreatePlane(`plane${i}`, {}, scene);
      this.timeSpellMeshes[i].scaling = new Vector3(0.3, 0.3, 0.3);
      this.timeSpellMeshes[i].parent = controller;
    }
  }

  private startTimeSpellParticles(scene: Scene) {
    const particleSystem = new ParticleSystem('particles', 200, scene);
    particleSystem.particleTexture = new Texture('./textures/gui/timeSpell/flare.png', scene);
    particleSystem.emitter = this.timeSpellMeshes[0];
    particleSystem.minEmitBox = new Vector3(-0.3, -0.3, 0);
    particleSystem.maxEmitBox = new Vector3(0.3, 0.3, 0);
    particleSystem.color1 = new Color4(0.7, 1, 0.74);
    particleSystem.color2 = new Color4(0.01, 0.5, 0.09);
    particleSystem.colorDead = new Color4(0, 0.2, 0, 0);
    particleSystem.minSize = 0.002;
    particleSystem.maxSize = 0.01;
    particleSystem.minLifeTime = 0.2;
    particleSystem.maxLifeTime = 0.6;
    particleSystem.emitRate = 1500;
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.direction1 = new Vector3(-0.03, 0.03, 0.03);
    particleSystem.direction2 = new Vector3(0.03, 0.03, -0.03);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.minEmitPower = 0;
    particleSystem.maxEmitPower = 0;
    particleSystem.updateSpeed = 0.005;
    const noiseTexture = new NoiseProceduralTexture('perlin', 256, scene);
    noiseTexture.animationSpeedFactor = 5;
    noiseTexture.persistence = 2;
    noiseTexture.brightness = 0.5;
    noiseTexture.octaves = 8;
    particleSystem.noiseTexture = noiseTexture;
    particleSystem.noiseStrength = new Vector3(1, 1, 1);
    particleSystem.start();
  }

  public setInTimeEditMode(status: boolean): void {
    this.inTimeEditMode = status;
  }

  public isInTimeEditMode(): boolean {
    return this.inTimeEditMode;
  }

  private convertRadiansToHours(radians: number): number {
    return radians*24/(Math.PI*2);
  }
}
