import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {AbstractMesh, Material, Nullable, PickingInfo, StandardMaterial, TransformNode} from '@babylonjs/core';
import {Building, Street} from '../../../dataLayer/model/projectData/layout/internal';
import {Scene} from '@babylonjs/core/scene';
import {Color3, Vector3} from '@babylonjs/core/Maths/math';
import {GuiMetrics} from '../gui/guiMetrics/guiMetrics';
import {World} from '../internal.lazy';
import {App} from '../../application/app';

export class City {
  public readonly classBuildingMaterial: StandardMaterial;
  public readonly interfaceBuildingMaterial: StandardMaterial;
  public readonly enumBuildingMaterial: StandardMaterial;
  public readonly selectionEmissiveMaterial: StandardMaterial;

  private readonly classColor: Color3 = new Color3(1, 228 / 255, 201 / 255);
  private readonly interfaceColor: Color3 = new Color3(186 / 255, 231 / 255, 245 / 255);
  private readonly enumColor: Color3 = new Color3(198 / 255, 247 / 255, 201 / 255);
  private readonly selectionColor: Color3 = new Color3(0, 0.5, .7);

  private readonly cityTerrain?: Mesh;
  private readonly cityTransformNode: TransformNode;
  private readonly cityWidth: number = 1;
  private buildingMeshMapping: Map<AbstractMesh, Building> = new Map<AbstractMesh, Building>();
  private streetMeshMapping: Map<AbstractMesh, Street> = new Map<AbstractMesh, Street>();
  private treeMeshList: AbstractMesh[] = [];
  private objectMeshArray: AbstractMesh[] = [];

  public static readonly SMALLSCALE_CITY_DEFAULT_SIZE = 1;
  public static readonly UPPERBOUND_LARGESCALE_CITY = 150;
  public static readonly LOWERBOUND_LARGESCALE_CITY = 20;
  public static readonly UPPERBOUND_SMALLSCALE_CITY = 2;
  public static readonly LOWERBOUND_SMALLSCALE_CITY = 0.2;

  constructor(
    private scene: Scene,
    private world: World,
    private appContext: App,
  ) {
    this.cityTransformNode = new TransformNode('cityRoot');
    this.cityTerrain = this.createCityTerrain(this.scene, this.cityTransformNode);
    this.classBuildingMaterial = new StandardMaterial('classBuildingMaterial', scene);
    this.interfaceBuildingMaterial = new StandardMaterial('interfaceBuildingMaterial', scene);
    this.enumBuildingMaterial = new StandardMaterial('enumBuildingMaterial', scene);
    this.selectionEmissiveMaterial = new StandardMaterial('selectionEmissiveMaterial', scene);
    this.classBuildingMaterial.diffuseColor = this.classColor;
    this.interfaceBuildingMaterial.diffuseColor = this.interfaceColor;
    this.enumBuildingMaterial.diffuseColor = this.enumColor;
    this.selectionEmissiveMaterial.emissiveColor = this.selectionColor;
  }

  private createCityTerrain(scene: Scene, transformNode: TransformNode): Mesh {
    const ground = Mesh.CreateGround('ground1', this.cityWidth, this.cityWidth, 2, scene);
    ground.parent = transformNode;
    ground.receiveShadows = true;
    return ground;
  }

  public rotateCity(degrees: number): void {
    if (this.cityTransformNode.scaling.x > City.LOWERBOUND_SMALLSCALE_CITY && this.cityTransformNode.scaling.x < City.UPPERBOUND_SMALLSCALE_CITY) {
      this.cityTransformNode.rotation.y += degrees;
    }
  }

  public scaleCity(factor: number): void {
    const newSize = this.cityTransformNode.scaling.x * factor;
    if (this.getScalingFactor() <= City.UPPERBOUND_SMALLSCALE_CITY) {
      if (newSize > City.LOWERBOUND_SMALLSCALE_CITY && newSize < City.UPPERBOUND_SMALLSCALE_CITY) {
        this.scaleCityToAbsoluteValue(newSize);
      }
    } else {
      if (newSize > City.LOWERBOUND_LARGESCALE_CITY && newSize < City.UPPERBOUND_LARGESCALE_CITY) {
        const polygon = this.calculateNewGround(newSize);
        const xrHelper = this.world!.getBabylonjsController().getXrHelper();
        if (xrHelper) {
          const test = [xrHelper.baseExperience.camera.position.x, xrHelper.baseExperience.camera.position.z];
          if (this.inside(test, polygon)) this.scaleCityToAbsoluteValue(newSize);
        }
      }
    }
  }

  public scaleCityToLarge(): void {
    let projectWeight = this.appContext.getDataContext().getProcessedProject().getWeight();
    projectWeight = projectWeight > 1000 ? 1000 : projectWeight;
    this.scaleCityToAbsoluteValue(((19 / 200) * projectWeight + 25));
  }

  public scaleCityToSmall(): void {
    this.scaleCityToAbsoluteValue(City.SMALLSCALE_CITY_DEFAULT_SIZE);
  }

  private scaleCityToAbsoluteValue(value: number): void {
    this.cityTransformNode.scaling = new Vector3(value, value, value);
  }

  public isScaledToSmallSize(): boolean {
    return this.getScalingFactor() <= City.UPPERBOUND_SMALLSCALE_CITY;
  }

  public addBuildingToMeshMapping(meshBuilding: AbstractMesh, building: Building): void {
    this.buildingMeshMapping.set(meshBuilding, building);
  }

  public addStreetToMeshMapping(meshStreet: AbstractMesh, street: Street): void {
    this.streetMeshMapping.set(meshStreet, street);
  }

  public addTreeToList(mesh: AbstractMesh): void {
    this.treeMeshList.push(mesh);
  }

  public addObjectToMeshArray(meshObject: AbstractMesh): void {
    this.objectMeshArray.push(meshObject);
  }

  public handleMeshSelected(pickResult: PickingInfo) {
    const pickedMesh = pickResult.pickedMesh!;
    this.selectBuildingMesh(pickedMesh);
  }

  public selectBuildingMesh(pickedMesh: AbstractMesh) {
    if (pickedMesh && this.buildingMeshMapping.has(pickedMesh)) {
      const building = this.buildingMeshMapping.get(pickedMesh)!;
      if (this.world.getGuiGrid().alreadyExistsMetricsForBuilding(building)) {
        const window = this.world.getGuiGrid().getWindowForBuilding(building)!;
        this.world.getGuiGrid().remove(window);
      } else {
        const window = new GuiMetrics(this.scene, this.world.getCamera(), this.world, this, building, pickedMesh);
        this.world.getGuiGrid().add(window);
      }
    }
  }

  public dispose(): void {
    this.streetMeshMapping.forEach((_, mesh) => mesh.dispose());
    this.buildingMeshMapping.forEach((_, mesh) => mesh.dispose());
    this.treeMeshList.forEach((mesh) => mesh.dispose());
    this.objectMeshArray.forEach((mesh) => mesh.dispose());
    this.streetMeshMapping.clear();
    this.buildingMeshMapping.clear();
    this.treeMeshList = [];
    this.objectMeshArray = [];
  }

  public isMeshAStreet(mesh: Nullable<AbstractMesh>): boolean {
    if (mesh) {
      return this.streetMeshMapping.has(mesh);
    }
    return false;
  }

  public colorAllMeshesForBuilding(building: Building, material: Nullable<Material>): void {
    this.getAllMeshesForBuilding(building).forEach((mesh) => {
      mesh.material = material;
    });
  }

  private calculateNewGround(newSize: number) {
    const alpha = this.cityTransformNode.rotation.y;
    const p0 = [0.5, 0.5];
    const p1 = [0.5, -0.5];
    const p2 = [-0.5, 0.5];
    const p3 = [-0.5, -0.5];
    const rotationCounterClockWiseMatrix = [
      [Math.cos(alpha), -Math.sin(alpha)],
      [Math.sin(alpha), Math.cos(alpha)],
    ];
    const rotationClockWiseMatrix = [
      [Math.cos(alpha), Math.sin(alpha)],
      [-Math.sin(alpha), Math.cos(alpha)],
    ];
    const p0T = this.calculateNewPoint(p0, rotationClockWiseMatrix, newSize);
    const p1T = this.calculateNewPoint(p1, rotationCounterClockWiseMatrix, newSize);
    const p2T = this.calculateNewPoint(p2, rotationCounterClockWiseMatrix, newSize);
    const p3T = this.calculateNewPoint(p3, rotationClockWiseMatrix, newSize);
    return [p0T, p1T, p3T, p2T];
  }

  private calculateNewPoint(p: number[], rotationMatrix: number[][], scaleFactor: number) {
    return [
      (p[0] * rotationMatrix[0][0] + p[0] * rotationMatrix[0][1]) * scaleFactor,
      (p[1] * rotationMatrix[1][0] + p[1] * rotationMatrix[1][1]) * scaleFactor,
    ];
  }

  private inside(point, vs): boolean {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
    const x = point[0];
    const y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i][0]; const yi = vs[i][1];
      const xj = vs[j][0]; const yj = vs[j][1];

      const intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  public getAllMeshesForBuilding(building: Building): AbstractMesh[] {
    return [...this.buildingMeshMapping.entries()]
        .filter(([mesh, currentBuilding]) => currentBuilding === building)
        .map(([mesh, currentBuilding]) => mesh);
  }

  public getScalingFactor(): number {
    return this.cityTransformNode.scaling.x;
  }

  public getCityTransformNode(): TransformNode {
    return this.cityTransformNode;
  }

  public getCityWidth(): number {
    return this.cityWidth;
  }

  public getFloor(): Mesh {
    return <Mesh> this.cityTerrain;
  }

  public getBuildingMeshMapping(): Map<AbstractMesh, Building> {
    return this.buildingMeshMapping;
  }
}
