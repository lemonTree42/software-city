import {MenuItem} from './menuItem';
import {Control, Grid, Style, TextBlock} from '@babylonjs/gui/2D';
import {World} from '../../../world';

export class GuiAboutMenu implements MenuItem {
  public draw(layout: Grid, textStyle: Style, world: World): void {
    layout.addColumnDefinition(40, true);
    layout.addColumnDefinition(1);
    layout.addColumnDefinition(40, true);
    layout.addRowDefinition(30, true);
    layout.addRowDefinition(1);
    layout.addRowDefinition(1);

    const aboutText = new TextBlock();
    aboutText.color = '#494949';
    aboutText.textWrapping = true;
    aboutText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    aboutText.resizeToFit = true;
    aboutText.text = 'The initial version of incode was made by Joel Hirzel and Thomas Hindermann, ' +
        'students of the OST, as part of their study project in 2021.';
    aboutText.fontFamily = 'Lato';
    aboutText.fontSize = 40;
    layout.addControl(aboutText, 1, 1);

    const builtText = new TextBlock();
    builtText.color = '#494949';
    builtText.textWrapping = true;
    builtText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    aboutText.resizeToFit = true;
    builtText.text = 'Incode is build with Babylon.js.';
    builtText.fontFamily = 'Lato';
    builtText.fontSize = 40;
    layout.addControl(builtText, 2, 1);
  }

  public onAboutToBeDeactivated() {
  }
}
