import {GuiFramed} from '../guiFramed';
import {Button, Grid, ScrollViewer, TextBlock} from '@babylonjs/gui/2D';
import {Scene} from '@babylonjs/core/scene';
import {FreeCamera} from '@babylonjs/core/Cameras/freeCamera';
import {World} from '../../world';
import {Building} from '../../../../dataLayer/model/projectData/layout/internal';
import {AbstractMesh, Material, Nullable} from '@babylonjs/core';
import {City} from '../../city/internal.lazy';

// eslint-disable-next-line no-unused-vars
enum Alignment {
  // eslint-disable-next-line no-unused-vars
  LEFT, RIGHT
}

export class GuiMetrics extends GuiFramed {
  private showingSourceCode: boolean = false;
  private previousMaterials: {mesh: AbstractMesh, material: Nullable<Material>}[];

  constructor(
      scene: Scene,
      camera: FreeCamera,
      world: World,
      private city: City,
      private building: Building,
      private buildingMesh: AbstractMesh,
  ) {
    super(scene, camera, world);
    this.previousMaterials = city.getAllMeshesForBuilding(building).map((mesh) => {
      return {mesh, material: mesh.material};
    });
    city.colorAllMeshesForBuilding(building, city.selectionEmissiveMaterial);
  }

  protected drawContent(layout: Grid): void {
    this.reset(layout);
    if (this.showingSourceCode) {
      this.drawSourceCode(layout);
      this.backButton.isVisible = true;
    } else {
      this.drawMetrics(layout);
      this.backButton.isVisible = false;
    }
  }

  private drawMetrics(layout: Grid): void {
    layout.addColumnDefinition(100, true);
    layout.addColumnDefinition(1);
    layout.addColumnDefinition(100, true);
    layout.addRowDefinition(1);
    layout.addRowDefinition(150, true);
    layout.addRowDefinition(80, true);

    const metricsLayout = new Grid();
    metricsLayout.addColumnDefinition(1);
    metricsLayout.addColumnDefinition(1);
    layout.addControl(metricsLayout, 0, 1);

    let index = 0;
    this.createTextBlock('Name', metricsLayout, index++, 0, Alignment.LEFT);
    this.building.getMetrics().containsMainMethod && this.createTextBlock('Role', metricsLayout, index++, 0, Alignment.LEFT);
    this.createTextBlock('Type', metricsLayout, index++, 0, Alignment.LEFT);
    this.createTextBlock('Lines', metricsLayout, index++, 0, Alignment.LEFT);
    this.createTextBlock('Methods', metricsLayout, index++, 0, Alignment.LEFT);
    this.createTextBlock('Fields', metricsLayout, index++, 0, Alignment.LEFT);
    this.createTextBlock('Quarter', metricsLayout, index++, 0, Alignment.LEFT);
    this.createTextBlock('Modifiers', metricsLayout, index, 0, Alignment.LEFT);
    index = 0;
    this.createTextBlock(this.building.getName(), metricsLayout, index++, 1, Alignment.RIGHT);
    this.building.getMetrics().containsMainMethod && this.createTextBlock('Town Hall', metricsLayout, index++, 1, Alignment.RIGHT);
    this.createTextBlock(this.building.getType()+'', metricsLayout, index++, 1, Alignment.RIGHT);
    this.createTextBlock(this.building.getMetrics().lineCount+'', metricsLayout, index++, 1, Alignment.RIGHT);
    this.createTextBlock(this.building.getMetrics().methodCount+'', metricsLayout, index++, 1, Alignment.RIGHT);
    this.createTextBlock(this.building.getMetrics().fieldCount+'', metricsLayout, index++, 1, Alignment.RIGHT);
    this.createTextBlock(this.building.getMetrics().path+'', metricsLayout, index++, 1, Alignment.RIGHT);
    this.createTextBlock(this.building.getMetrics().modifiers.toString()+'', metricsLayout, index, 1, Alignment.RIGHT);

    const sourceCodeButton = Button.CreateSimpleButton('showSourceCodeButton', 'Show Source Code');
    sourceCodeButton.paddingTopInPixels = 15;
    sourceCodeButton.paddingBottomInPixels = 15;
    sourceCodeButton.color = 'white';
    sourceCodeButton.cornerRadius = 20;
    sourceCodeButton.fontSize = 70;
    sourceCodeButton.background = '#275082';
    sourceCodeButton.style = this.textBodyStyle;
    sourceCodeButton.onPointerUpObservable.add(() => {
      this.showingSourceCode = true;
      this.drawContent(this.contentLayout);
    });
    layout.addControl(sourceCodeButton, 1, 1);
  }

  private drawSourceCode(layout: Grid): void {
    layout.addColumnDefinition(70, true);
    layout.addColumnDefinition(1);
    layout.addColumnDefinition(70, true);

    const scrollViewer = new ScrollViewer();
    scrollViewer.style = this.textBodyStyle;

    const sourceCode = new TextBlock();
    sourceCode.textHorizontalAlignment = Alignment.LEFT;
    sourceCode.text = this.building.getMetrics().sourceCode;
    sourceCode.resizeToFit = true;
    sourceCode.paddingTop = '40px';
    sourceCode.paddingLeft = '40px';
    sourceCode.paddingRight = '40px';
    sourceCode.paddingBottom = '40px';
    sourceCode.color = '#494949';
    sourceCode.fontSize = 30;
    scrollViewer.addControl(sourceCode);

    layout.addRowDefinition(50, true);
    layout.addRowDefinition(1);
    layout.addControl(scrollViewer, 1, 1);
    layout.addRowDefinition(50, true);
  }

  private createTextBlock(name: string, layout: Grid, row: number, column: number, alignment: Alignment) {
    const textBlock = new TextBlock();
    textBlock.color = '#494949';
    textBlock.textHorizontalAlignment = alignment;
    textBlock.textWrapping = true;
    textBlock.text = name;
    if (name.length > 12) {
      textBlock.fontSize = name.length * -1.1 + 61;
      textBlock.fontFamily = 'Lato';
    } else {
      textBlock.style = this.textBodyStyle;
    }
    alignment===Alignment.LEFT && layout.addRowDefinition(85, true);
    layout.addControl(textBlock, row, column);
  }

  protected getHeader(): string {
    return 'Metrics';
  }

  public getBuilding(): Building {
    return this.building;
  }

  protected onBackClicked(): void {
    this.showingSourceCode = false;
    this.drawContent(this.contentLayout);
  }

  public dispose() {
    this.previousMaterials.forEach(({mesh, material}) => mesh.material = material);
    super.dispose();
  }
}
