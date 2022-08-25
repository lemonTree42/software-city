import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {Scene} from '@babylonjs/core/scene';
import {AdvancedDynamicTexture, Button, Grid, Rectangle, Style, TextBlock} from '@babylonjs/gui/2D';
import {FreeCamera} from '@babylonjs/core/Cameras/freeCamera';
import {World} from '../world';

export abstract class GuiFramed {
  protected window: Mesh;
  protected advancedTexture: AdvancedDynamicTexture;
  protected headerStyle: Style;
  protected textBodyStyle: Style;
  protected positionToHandButton!: Button;
  protected positionToCameraButton!: Button;
  protected backButton!: Button;
  protected contentLayout: Grid = new Grid();
  protected buttonTopLayout: Grid = new Grid;
  private title: TextBlock = new TextBlock();
  private frameExists: boolean = false;

  protected constructor(
    protected scene: Scene,
    protected camera: FreeCamera,
    protected world: World,
  ) {
    this.window = MeshBuilder.CreatePlane('plane', {}, scene);
    this.advancedTexture = AdvancedDynamicTexture.CreateForMesh(this.window);
    this.headerStyle = this.createHeaderStyle(this.advancedTexture);
    this.textBodyStyle = this.createNormalStyle(this.advancedTexture);
  }

  public draw(): void {
    this.window.setEnabled(true);

    if (!this.frameExists) {
      const windowFrame = new Rectangle();
      windowFrame.background = '#faf7ff';
      windowFrame.thickness = 0;
      windowFrame.cornerRadius = 56;
      this.advancedTexture.addControl(windowFrame);

      const frameLayout = new Grid();
      frameLayout.addColumnDefinition(1);
      frameLayout.addRowDefinition(100, true);
      frameLayout.addRowDefinition(1);
      windowFrame.addControl(frameLayout);

      frameLayout.addControl(this.buttonTopLayout, 0, 0);

      frameLayout.addControl(this.contentLayout, 1, 0);

      this.buttonTopLayout.addColumnDefinition(100, true);
      this.buttonTopLayout.addColumnDefinition(1);
      this.buttonTopLayout.addColumnDefinition(100, true);
      this.buttonTopLayout.addColumnDefinition(100, true);
      this.buttonTopLayout.addRowDefinition(1);

      this.drawTopRow(this.buttonTopLayout);
      this.frameExists = true;
    }

    this.drawContent(this.contentLayout);
  }

  private createHeaderStyle(advancedTexture: AdvancedDynamicTexture): Style {
    const headerStyle = advancedTexture.createStyle();
    headerStyle.fontSize = 90;
    headerStyle.fontStyle = 'bold';
    headerStyle.fontFamily = 'Lato';
    return headerStyle;
  }

  private createNormalStyle(advancedTexture: AdvancedDynamicTexture): Style {
    const normalStyle = advancedTexture.createStyle();
    normalStyle.fontSize = 60;
    normalStyle.fontFamily = 'Lato';
    return normalStyle;
  }

  protected abstract drawContent(contentLayout: Grid): void;

  protected abstract getHeader(): string;

  private drawTopRow(buttonTopLayout: Grid): void {
    this.backButton = Button.CreateImageOnlyButton(
        'closeButton',
        'textures/left-arrow.png',
    );
    this.backButton.paddingTopInPixels = 10;
    this.backButton.paddingLeftInPixels = 10;
    this.backButton.paddingRightInPixels = 10;
    this.backButton.paddingBottomInPixels = 10;
    this.backButton.onPointerUpObservable.add(() => this.onBackClicked());
    buttonTopLayout.addControl(this.backButton, 0, 0);

    this.drawHeader(buttonTopLayout);

    this.positionToHandButton = Button.CreateImageOnlyButton(
        'positionToggleButton',
        'textures/down-arrow.png',
    );

    this.positionToHandButton.paddingTopInPixels = 10;
    this.positionToHandButton.paddingLeftInPixels = 10;
    this.positionToHandButton.paddingRightInPixels = 10;
    this.positionToHandButton.paddingBottomInPixels = 10;
    this.positionToHandButton.onPointerUpObservable.add(() => {
      this.world.getGuiGrid().moveToHand();
    });
    buttonTopLayout.addControl(this.positionToHandButton, 0, 2);
    this.positionToCameraButton = Button.CreateImageOnlyButton(
        'positionToggleButton',
        'textures/up-arrow.png',
    );

    this.positionToCameraButton.paddingTopInPixels = 10;
    this.positionToCameraButton.paddingLeftInPixels = 10;
    this.positionToCameraButton.paddingRightInPixels = 10;
    this.positionToCameraButton.paddingBottomInPixels = 10;
    this.positionToCameraButton.onPointerUpObservable.add(() => {
      this.world.getGuiGrid().moveInFrontOfCamera();
    });

    const closeButton = Button.CreateImageOnlyButton(
        'closeButton',
        'textures/cross.png',
    );
    closeButton.paddingTopInPixels = 10;
    closeButton.paddingLeftInPixels = 10;
    closeButton.paddingRightInPixels = 10;
    closeButton.paddingBottomInPixels = 10;
    closeButton.onPointerUpObservable.add(() => this.world.getGuiGrid().remove(this));
    buttonTopLayout.addControl(closeButton, 0, 3);
  }

  protected drawHeader(buttonTopLayout: Grid): void {
    buttonTopLayout.removeControl(this.title);
    this.title = new TextBlock();
    this.title.text = this.getHeader().charAt(0).toUpperCase() + this.getHeader().slice(1);
    this.title.fontSize = 80;
    this.title.color = '#494949';
    this.title.fontStyle = 'bold';
    this.title.fontFamily = 'Lato';
    this.title.paddingLeftInPixels = 100;
    buttonTopLayout.addControl(this.title, 0, 1);
  }

  protected onWindowAboutToBeClosed(): void {}

  public changeWindowMoveButtonUp(): void {
    this.buttonTopLayout.removeControl(this.positionToHandButton);
    this.buttonTopLayout.addControl(this.positionToCameraButton, 0, 2);
  }

  public changeWindowMoveButtonDown(): void {
    this.buttonTopLayout.removeControl(this.positionToCameraButton);
    this.buttonTopLayout.addControl(this.positionToHandButton, 0, 2);
  }

  protected onBackClicked(): void {
  }

  public getMesh(): Mesh {
    return this.window;
  }

  public dispose(): void {
    this.window.dispose();
  }

  protected reset(layout: Grid): void {
    for (let i=0; i<20; i++) {
      layout.removeColumnDefinition(0);
      layout.removeRowDefinition(0);
    }
  }
}
