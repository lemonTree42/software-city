/* eslint-disable no-unused-vars */
import {Scene} from '@babylonjs/core/scene';
import {FreeCamera} from '@babylonjs/core/Cameras/freeCamera';
import {BabylonJsController} from '../../../controller/babylonJsController';
import {App} from '../../../application/app';
import {GuiFramed} from '../guiFramed';
import {Button, Grid, Rectangle} from '@babylonjs/gui/2D';
import {MenuItem} from './mainMenus/menuItem';
import {GuiViewMenu} from './mainMenus/guiViewMenu';
import {World} from '../../world';
import {GuiSettingMenu} from './mainMenus/guiSettingMenu';
import {GuiAboutMenu} from './mainMenus/guiAboutMenu';
import {GuiProjectStatisticsMenu} from './mainMenus/guiProjectStatisticsMenu';
import {GuiFilterMenu} from './mainMenus/guiFilterMenu';
import {GuiSearchComponentMenu} from './mainMenus/guiSearchComponentsMenu';

/* eslint-disable-next-line no-unused-vars */
enum Menus {
  PROJECT_STATISTICS = 'statistics',
  FILTER = 'filter',
  SEARCH = 'search',
  VIEW = 'view',
  SETTINGS = 'settings',
  ABOUT = 'about',
}

export class GuiMenu extends GuiFramed {
  private menus: {[name: string]: {item: MenuItem, menuButton: Button}} = {};
  private selectedMenu: Menus = Menus.PROJECT_STATISTICS;
  private menuContentLayout?: Grid;
  private previouslySelectedMenu: MenuItem | undefined;

  constructor(
      scene: Scene,
      camera: FreeCamera,
      world: World,
      protected babylonjsController: BabylonJsController,
      protected appContext: App,
  ) {
    super(scene, camera, world);
    this.initMenuItems();
  }

  private initMenuItems() {
    this.menus[Menus.PROJECT_STATISTICS] = {item: new GuiProjectStatisticsMenu(this.appContext), menuButton: this.createMenuButton(Menus.PROJECT_STATISTICS,
        'textures/gui/statisticsMenu.png')};
    this.menus[Menus.VIEW] = {item: new GuiViewMenu(this.scene, this.world, this.appContext, this.textBodyStyle), menuButton: this.createMenuButton(Menus.VIEW,
        'textures/gui/viewMenu.png')};
    this.menus[Menus.FILTER] = {item: new GuiFilterMenu(this.world.getCity(), this.appContext), menuButton: this.createMenuButton(Menus.FILTER,
        'textures/gui/filterMenu.png')};
    this.menus[Menus.SEARCH] = {item: new GuiSearchComponentMenu(this.world.getCity(), this.babylonjsController),
      menuButton: this.createMenuButton(Menus.SEARCH, 'textures/gui/searchMenu.png')};
    this.menus[Menus.SETTINGS] = {item: new GuiSettingMenu(this.babylonjsController, this.appContext), menuButton:
       this.createMenuButton(Menus.SETTINGS, 'textures/gui/settingsMenu.png')};
    this.menus[Menus.ABOUT] = {item: new GuiAboutMenu(), menuButton: this.createMenuButton(Menus.ABOUT, 'textures/gui/aboutMenu.png')};
  }

  protected drawContent(layout: Grid): void {
    this.previouslySelectedMenu?.onAboutToBeDeactivated();
    this.reset(layout);
    this.backButton.isVisible = false;

    layout.addColumnDefinition(150, true);
    layout.addColumnDefinition(3, true);
    layout.addColumnDefinition(1);
    layout.addRowDefinition(1);

    const grid = new Grid();
    grid.addColumnDefinition(1);
    grid.addRowDefinition(150, true);
    grid.addRowDefinition(150, true);
    grid.addRowDefinition(150, true);
    grid.addRowDefinition(150, true);
    grid.addRowDefinition(150, true);
    grid.addRowDefinition(150, true);
    this.drawMenuButtons(grid);
    layout.addControl(grid, 0, 0);

    const rect1 = new Rectangle();
    rect1.background = '#7a7a7f';
    rect1.paddingBottomInPixels = 50;
    layout.addControl(rect1, 0, 1);

    this.drawMenuContent(layout);
  }

  protected getHeader(): string {
    return this.selectedMenu;
  }

  private drawMenuContent(layout: Grid) {
    if (this.menuContentLayout) {
      layout.removeControl(this.menuContentLayout);
    }
    const gridContent = new Grid();
    this.menuContentLayout = gridContent;
    layout.addControl(gridContent, 0, 2);
    this.menus[this.selectedMenu].item.draw(gridContent, this.textBodyStyle, this.world);
    this.previouslySelectedMenu = this.menus[this.selectedMenu].item;
  }

  private createMenuButton(menu: Menus, imagePath: string): Button {
    const viewButton = Button.CreateImageOnlyButton('menuButton', imagePath);
    viewButton.paddingTopInPixels = 20;
    viewButton.paddingLeftInPixels = 20;
    viewButton.paddingRightInPixels = 20;
    viewButton.paddingBottomInPixels = 20;
    viewButton.onPointerUpObservable.add(() => {
      this.selectedMenu = menu;
      this.drawHeader(this.buttonTopLayout);
      this.drawContent(this.contentLayout);
    });
    return viewButton;
  }

  private drawMenuButtons(layout: Grid): void {
    let i = 0;
    for (const [key, entry] of Object.entries(this.menus)) {
      if (key === this.selectedMenu) {
        layout.addControl(this.createMenuButton(key, `textures/gui/${key}MenuActive.png`), i, 0);
      } else {
        layout.addControl(entry.menuButton, i, 0);
      }
      i++;
    }
  }

  public dispose(): void {
    this.window.setEnabled(false);
  }
}
