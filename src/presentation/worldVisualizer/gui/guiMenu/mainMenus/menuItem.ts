import {Grid, Style} from '@babylonjs/gui/2D';
import {World} from '../../../world';

export interface MenuItem {
  draw(layout: Grid, textStyle: Style, world: World): void;
  onAboutToBeDeactivated(): void;
}
