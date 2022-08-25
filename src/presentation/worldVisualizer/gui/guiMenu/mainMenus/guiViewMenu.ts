import {MenuItem} from './menuItem';
import {Button, Grid, Style, TextBlock} from '@babylonjs/gui/2D';
import {World} from '../../../world';
import {TimeObserver} from '../../../environment/internal.lazy';
import {Scene} from '@babylonjs/core/scene';
import {TeleportationPointSelectionHelper, TimeChangeHelper} from './guiViewMenuHelper/internal.lazy';
import {App} from '../../../../application/app';
import {DisplayingStateStatus} from '../../../../application/states/stateStatus';

export class GuiViewMenu implements MenuItem, TimeObserver {
  private rotateText: TextBlock = new TextBlock();
  private zoomText: TextBlock = new TextBlock();
  private timeText: TextBlock = new TextBlock();
  private timeValueText: TextBlock = new TextBlock();
  private visitCityText: TextBlock = new TextBlock();
  private toggleShadowText: TextBlock = new TextBlock();
  private enhanceBuildingsText: TextBlock = new TextBlock();
  private timeEditButton: Button = Button.CreateImageOnlyButton('timeEditButton', 'textures/gui/time-edit.png');
  private timeEditDoneButton: Button = Button.CreateImageOnlyButton('timeEditDoneButton', 'textures/gui/time-edit-done.png');
  private goInsideCityButton: Button = Button.CreateImageOnlyButton('goInsideCity', 'textures/gui/go-inside-city.png');
  private goOutsideCityButton: Button = Button.CreateImageOnlyButton('goOutsideCity', 'textures/gui/go-outside-city.png');
  private cancelCityPointSelectionButton: Button = Button.CreateImageOnlyButton('cancelButton', 'textures/gui/cancel.png');
  private rotateLeftButton: Button = Button.CreateImageOnlyButton('rotateLeftButton', 'textures/gui/rotating-arrow-to-the-right.png');
  private rotateRightButton: Button = Button.CreateImageOnlyButton('rotateRightButton', 'textures/gui/rotating-arrow-to-the-left.png');
  private zoomInButton: Button = Button.CreateImageOnlyButton('zoomInButton', 'textures/gui/zoom-in.png');
  private zoomOutButton: Button = Button.CreateImageOnlyButton('zoomOutButton', 'textures/gui/zoom-out.png');
  private enableShadowButton: Button = Button.CreateImageOnlyButton('enableShadowButton', 'textures/gui/toggleShadow.png');
  private disableShadowButton: Button = Button.CreateImageOnlyButton('disableShadowButton', 'textures/gui/toggleShadowActive.png');
  private enhanceBuildingQualityButton: Button = Button.CreateImageOnlyButton('enhanceBuildingButton', 'textures/gui/enhanceBuilding.png');
  private decreaseBuildingQualityButton: Button = Button.CreateImageOnlyButton('decreaseBuildingButton', 'textures/gui/enhanceBuildingActive.png');
  private layout?: Grid;

  private visitCityHandler: any;

  private teleportationPointSelectionHelper: TeleportationPointSelectionHelper;
  private timeChangeHelper: TimeChangeHelper;

  constructor(
      private scene: Scene,
      private world: World,
      private appContext: App,
      textStyle: Style,
  ) {
    this.teleportationPointSelectionHelper = new TeleportationPointSelectionHelper(this, scene, world);
    this.teleportationPointSelectionHelper.loadTeleportationArrows(scene);
    this.timeChangeHelper = new TimeChangeHelper(world, () => this.finishTimeEditing());
    this.initContent(textStyle);
    world.getTime().subscribeToTimeChange(this);
  }

  public draw(layout: Grid, textStyle: Style, world: World): void {
    this.layout = layout;

    layout.addColumnDefinition(500, true);
    layout.addColumnDefinition(1);
    layout.addColumnDefinition(200, true);
    layout.addColumnDefinition(200, true);
    layout.addRowDefinition(150, true);
    layout.addRowDefinition(150, true);
    layout.addRowDefinition(150, true);
    layout.addRowDefinition(150, true);
    layout.addRowDefinition(150, true);
    layout.addRowDefinition(150, true);
    layout.addRowDefinition(1);

    layout.addControl(this.rotateText, 0, 0);
    layout.addControl(this.rotateLeftButton, 0, 2);
    layout.addControl(this.rotateRightButton, 0, 3);
    layout.addControl(this.zoomText, 1, 0);
    layout.addControl(this.zoomInButton, 1, 2);
    layout.addControl(this.zoomOutButton, 1, 3);

    layout.addControl(this.timeText, 2, 0);
    layout.addControl(this.timeValueText, 2, 2);
    !this.timeChangeHelper.isInTimeEditMode() && layout.addControl(this.timeEditButton, 2, 3);
    this.timeChangeHelper.isInTimeEditMode() && layout.addControl(this.timeEditDoneButton, 2, 3);

    layout.addControl(this.visitCityText, 3, 0);
    if (this.world.getCity().isScaledToSmallSize()) {
      layout.addControl(this.goInsideCityButton, 3, 3);
      this.visitCityText.text = TeleportationPointSelectionHelper.VISIT_CITY_TEXT;
    } else {
      layout.addControl(this.goOutsideCityButton, 3, 3);
      this.visitCityText.text = TeleportationPointSelectionHelper.LEAVE_CITY_TEXT;
    }

    layout.addControl(this.enhanceBuildingsText, 4, 0);
    if (this.appContext.getDataContext().getConfig().renderSpecification.enhancedCity) {
      layout.addControl(this.decreaseBuildingQualityButton, 4, 3);
    } else {
      layout.addControl(this.enhanceBuildingQualityButton, 4, 3);
    }

    // layout.addControl(this.toggleShadowText, 5, 0);
    // layout.addControl(this.world.getLighting().areShadowsEndabled()?this.disableShadowButton:this.enableShadowButton, 5, 3);
  }

  private cancelTeleportationPointSelection(): void {
    this.visitCityText.text = TeleportationPointSelectionHelper.VISIT_CITY_TEXT;
    this.layout?.removeControl(this.cancelCityPointSelectionButton);
    this.layout?.removeControl(this.goOutsideCityButton);
    this.layout?.addControl(this.goInsideCityButton, 3, 3);
    this.scene.onPointerObservable.remove(this.visitCityHandler);
    this.teleportationPointSelectionHelper.disableArrows();
  }

  private initContent(textStyle: Style): void {
    this.initRotationControls(textStyle);
    this.initZoomControls(textStyle);
    this.initTimeEditControls(textStyle);
    this.initVisitCityControls(textStyle);
    // this.initToggleShadowControls(textStyle);
    this.initEnhanceBuildingsControls(textStyle);
  }

  private initEnhanceBuildingsControls(textStyle: Style): void {
    this.enhanceBuildingsText.text = 'Enhanced City';
    this.enhanceBuildingsText.textHorizontalAlignment = 0;
    this.enhanceBuildingsText.paddingLeftInPixels = 40;
    this.enhanceBuildingsText.style = textStyle;
    this.enhanceBuildingsText.color = '#5a5a5a';

    this.enhanceBuildingQualityButton.onPointerUpObservable.add(() => {
      this.appContext.getDataContext().getConfig().renderSpecification.enhancedCity = true;
      this.layout?.removeControl(this.enhanceBuildingQualityButton);
      this.layout?.addControl(this.decreaseBuildingQualityButton, 4, 3);
      this.appContext.getCurrentState().finish(DisplayingStateStatus.settingsChanged);
    });

    this.decreaseBuildingQualityButton.onPointerUpObservable.add(() => {
      this.appContext.getDataContext().getConfig().renderSpecification.enhancedCity = false;
      this.layout?.removeControl(this.decreaseBuildingQualityButton);
      this.layout?.addControl(this.enhanceBuildingQualityButton, 4, 3);
      this.appContext.getCurrentState().finish(DisplayingStateStatus.settingsChanged);
    });

    this.addPadding(this.enhanceBuildingQualityButton);
    this.addPadding(this.decreaseBuildingQualityButton);
  }

  // private initToggleShadowControls(textStyle: Style): void {
  //   this.toggleShadowText.text = 'Shadows';
  //   this.toggleShadowText.textHorizontalAlignment = 0;
  //   this.toggleShadowText.paddingLeftInPixels = 40;
  //   this.toggleShadowText.style = textStyle;
  //   this.toggleShadowText.color = '#5a5a5a';
  //
  //   this.enableShadowButton.onPointerUpObservable.add(() => {
  //     this.world.getLighting().enableShadows(true);
  //     this.layout?.removeControl(this.enableShadowButton);
  //     this.layout?.addControl(this.disableShadowButton, 5, 3);
  //   });
  //
  //   this.disableShadowButton.onPointerUpObservable.add(() => {
  //     this.world.getLighting().enableShadows(false);
  //     this.layout?.removeControl(this.disableShadowButton);
  //     this.layout?.addControl(this.enableShadowButton, 5, 3);
  //   });
  //
  //   this.addPadding(this.enableShadowButton);
  //   this.addPadding(this.disableShadowButton);
  // }

  private initVisitCityControls(textStyle: Style): void {
    this.visitCityText.text = this.world.getCity().isScaledToSmallSize()?
        TeleportationPointSelectionHelper.VISIT_CITY_TEXT:TeleportationPointSelectionHelper.LEAVE_CITY_TEXT;
    this.visitCityText.textHorizontalAlignment = 0;
    this.visitCityText.paddingLeftInPixels = 40;
    this.visitCityText.style = textStyle;
    this.visitCityText.color = '#5a5a5a';

    this.goInsideCityButton.onPointerUpObservable.add(() => {
      this.visitCityText.text = TeleportationPointSelectionHelper.SELECT_SPAWN_TEXT;
      this.layout?.removeControl(this.goInsideCityButton);
      this.layout?.removeControl(this.goOutsideCityButton);
      this.layout?.addControl(this.cancelCityPointSelectionButton, 3, 3);
      this.visitCityHandler = (pointerInfo) => this.teleportationPointSelectionHelper.selectTeleportationPoint(pointerInfo);
      this.visitCityHandler = this.scene.onPointerObservable.add(this.visitCityHandler);
    });

    this.goOutsideCityButton.onPointerUpObservable.add(() => {
      this.visitCityText.text = TeleportationPointSelectionHelper.VISIT_CITY_TEXT;
      this.layout?.removeControl(this.cancelCityPointSelectionButton);
      this.layout?.removeControl(this.goInsideCityButton);
      this.layout?.addControl(this.goInsideCityButton, 3, 3);
      this.world.scaleWorldToSmall();
      this.scene.onPointerObservable.remove(this.visitCityHandler);
    });

    this.cancelCityPointSelectionButton.onPointerUpObservable.add(() => this.cancelTeleportationPointSelection());

    this.addPadding(this.goOutsideCityButton);
    this.addPadding(this.goInsideCityButton);
    this.addPadding(this.cancelCityPointSelectionButton);
  }

  private initTimeEditControls(textStyle: Style): void {
    this.timeText.text = 'Time';
    this.timeText.textHorizontalAlignment = 0;
    this.timeText.paddingLeftInPixels = 40;
    this.timeText.style = textStyle;
    this.timeText.color = '#5a5a5a';

    this.timeValueText.text = this.world.getTime().toString();
    this.timeValueText.textHorizontalAlignment = 0;
    this.timeValueText.paddingLeftInPixels = 40;
    this.timeValueText.style = textStyle;
    this.timeValueText.color = '#5a5a5a';

    this.addPadding(this.timeEditButton);

    this.timeEditButton.onPointerUpObservable.add(() => {
      this.timeChangeHelper.setInTimeEditMode(true);
      const controller = this.world?.getBabylonjsController().getControllerRightHandMesh();
      this.timeChangeHelper.readControllerRotation(1.6 * (controller?.rotationQuaternion?.toEulerAngles().z || 0), 0, 0);
      this.layout?.removeControl(this.timeEditButton);
      this.layout?.addControl(this.timeEditDoneButton, 2, 3);
    });
    this.addPadding(this.timeEditDoneButton);

    this.timeEditDoneButton.onPointerUpObservable.add(() => this.finishTimeEditing());
  }

  private initZoomControls(textStyle: Style): void {
    this.zoomText.text = 'Zoom';
    this.zoomText.textHorizontalAlignment = 0;
    this.zoomText.paddingLeftInPixels = 40;
    this.zoomText.style = textStyle;
    this.zoomText.color = '#5a5a5a';

    this.addPadding(this.zoomInButton);
    this.zoomInButton.onPointerUpObservable.add(() => this.world.getCity().scaleCity(1.1));

    this.addPadding(this.zoomOutButton);
    this.zoomOutButton.onPointerUpObservable.add(() => this.world.getCity().scaleCity(0.9));
  }

  private initRotationControls(textStyle: Style): void {
    this.rotateText.text = 'Rotate';
    this.rotateText.textHorizontalAlignment = 0;
    this.rotateText.paddingLeftInPixels = 40;
    this.rotateText.style = textStyle;
    this.rotateText.color = '#5a5a5a';

    this.addPadding(this.rotateLeftButton);
    this.rotateLeftButton.onPointerUpObservable.add(() => this.world.getCity().rotateCity(0.2));

    this.addPadding(this.rotateRightButton);
    this.rotateRightButton.onPointerUpObservable.add(() => this.world.getCity().rotateCity(-0.2));
  }

  private addPadding(button: Button): void {
    button.paddingTopInPixels = 20;
    button.paddingLeftInPixels = 45;
    button.paddingRightInPixels = 45;
    button.paddingBottomInPixels = 20;
  }

  public updateTime(time: number, timeString: string): void {
    this.timeValueText.text = timeString;
  }

  public onAboutToBeDeactivated(): void {
    this.cancelTeleportationPointSelection();
  }

  public teleportationPointSelectionFinished(): void {
    this.visitCityText.text = TeleportationPointSelectionHelper.LEAVE_CITY_TEXT;
    this.layout!.removeControl(this.goInsideCityButton);
    this.layout!.removeControl(this.cancelCityPointSelectionButton);
    this.layout!.addControl(this.goOutsideCityButton, 3, 3);
    this.scene.onPointerObservable.remove(this.visitCityHandler);
  }

  public finishTimeEditing(): void {
    this.timeChangeHelper.setInTimeEditMode(false);
    this.timeChangeHelper.readControllerRotation(0, 0, 0);
    this.layout?.removeControl(this.timeEditDoneButton);
    this.layout?.addControl(this.timeEditButton, 2, 3);
  }
}
