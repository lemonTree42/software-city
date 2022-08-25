import {World} from '../../../world';
import {Grid, Style, InputText, Button, TextBlock} from '@babylonjs/gui/2D';
import {MenuItem} from './menuItem';
import {City} from '../../../internal.lazy';
import {Building} from '../../../../../dataLayer/model/projectData/layout/internal';
import {AbstractMesh} from '@babylonjs/core';
import {BabylonJsController} from '../../../../controller/internal.lazy';

export class GuiSearchComponentMenu implements MenuItem {
  private layout: Grid | undefined = undefined;
  private textStyle: Style | null = null;
  private world: World | null = null;
  private inputText: InputText | null = null;
  private textBlock: TextBlock = new TextBlock('textBlock');
  private searchableComponent: { mesh: AbstractMesh, building: Building } | null = null;
  private keyboard: Button[] = [];
  private babylonjsController: BabylonJsController | null = null;

  constructor(private city: City, babylonjsController: BabylonJsController) {
    this.babylonjsController = babylonjsController;
  }

  public draw(layout: Grid, textStyle: Style | null, world: World | null): void {
    this.layout = layout;
    this.textStyle = textStyle;
    this.world = world;

    layout?.addColumnDefinition(40, true);
    layout?.addColumnDefinition(1);
    layout?.addColumnDefinition(40, true);
    layout?.addRowDefinition(30, true);
    layout?.addRowDefinition(120, true);
    layout?.addRowDefinition(150, true);
    layout?.addRowDefinition(150, true);
    layout?.addRowDefinition(1);
    layout?.addRowDefinition(300, true);
    layout?.addRowDefinition(30, true);

    const keyboardLayout = new Grid();
    keyboardLayout.addColumnDefinition(0.1);
    keyboardLayout.addColumnDefinition(0.1);
    keyboardLayout.addColumnDefinition(0.1);
    keyboardLayout.addColumnDefinition(0.1);
    keyboardLayout.addColumnDefinition(0.1);
    keyboardLayout.addColumnDefinition(0.1);
    keyboardLayout.addColumnDefinition(0.1);
    keyboardLayout.addColumnDefinition(0.1);
    keyboardLayout.addColumnDefinition(0.1);
    keyboardLayout.addColumnDefinition(0.1);
    keyboardLayout.addRowDefinition(0.333);
    keyboardLayout.addRowDefinition(0.333);
    keyboardLayout.addRowDefinition(0.333);
    layout.addControl(keyboardLayout, 5, 1);

    this.createInputText(1, 1);
    this.createTextBlock('', 2, 1);
    this.createButton('SHOW', () => this.showComponent(), 3, 1);
    this.createKeyboard(keyboardLayout);
  }

  private createInputText(row: number, column: number) {
    const input = new InputText();
    input.width = '750px';
    input.height = '120px';
    input.fontSize = 80;
    input.placeholderColor = '#bbbbbb';
    input.placeholderText = 'search ...';
    input.color = '#000000';
    input.background = 'white';
    input.focusedBackground = 'white';
    input.thickness = 2;
    input.onTextChangedObservable.add(() => {
      this.inputText!.text = input.text;
    });
    this.layout?.addControl(input, row, column);
    this.inputText = input;
  }

  private createKeyboard(layout: Grid) {
    this.createKeyboardRow(0, 65, 74, layout); // 65 is ASCII Code for 'A'
    this.createKeyboardRow(1, 75, 84, layout);
    this.createKeyboardRow(2, 85, 90, layout); // 90 is ASCII Code for 'Z'
    this.createButton('⇦', () => {
      if (!this.inputText) {
        return;
      }
      this.babylonjsController?.vibrateControllerRightHand(0.5, 100);
      this.inputText.text = this.inputText.text.slice(0, this.inputText.text.length - 1);
    }, 2, 9, layout);
  }

  private createKeyboardRow(row: number, lower: number, upper: number, layout: Grid) {
    for (let c = lower; c <= upper; c++) {
      const button = this.createButton(String.fromCharCode(c), (b = button) => {
        this.inputText!.text += b.textBlock?.text;
        this.babylonjsController?.vibrateControllerRightHand(0.5, 100);
      }, row, c - lower, layout, 80, 'white');
      this.keyboard.push(button);
    }
  }

  private searchComponent() {
    const components: { mesh: AbstractMesh, building: Building }[] = [];
    this.world?.getCity().getBuildingMeshMapping().forEach((building, key, map) => {
      if (building.getName().toUpperCase() === this.inputText!.text.toUpperCase()) {
        components.push({mesh: key, building: building});
      }
    });
    if (components.length > 0) {
      this.searchableComponent = components[0];
      const building = components[0].building;
      this.textBlock.text =
        `We found ${building.getType() === 'Class' ? 'a' : 'an'} ${building.getType()} with the name '${building.getName()}'`;
      this.textBlock.color = 'green';
    } else {
      this.searchableComponent = null;
      this.textBlock.text = 'We did not find a class/interface/enum with this name';
      this.textBlock.color = 'red';
    }
  }

  private showComponent() {
    this.searchComponent();
    if (this.searchableComponent) {
      this.world?.getCity().selectBuildingMesh(this.searchableComponent.mesh);
    }
  }

  private createButton(name: string, callback: any, row: number, column: number, layout = this.layout, width?: number,
      color?: string): Button {
    const button = Button.CreateSimpleButton(`${name}`, `${name}`);
    button.width = width ? width + '%' : '80%';
    button.height = '70%';
    button.color = 'white';
    button.fontSize = 40;
    button.cornerRadius = 20;
    button.background = '#275082';
    button.onPointerClickObservable.add(() => callback());
    if (color === 'white') {
      button.background = color;
      button.color = 'black';
    }
    layout?.addControl(button, row, column);
    return button;
  }

  private createTextBlock(text: string, row: number, column: number) {
    const textBlock = new TextBlock('textBlock');
    textBlock.textWrapping = true;
    textBlock.text = text;
    textBlock.fontSize = 30;
    textBlock.fontFamily = 'Lato';
    this.textBlock = textBlock;
    this.layout?.addControl(this.textBlock, row, column);
  }

  public onAboutToBeDeactivated() {
  }
}
