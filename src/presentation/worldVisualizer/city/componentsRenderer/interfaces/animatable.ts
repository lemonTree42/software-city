import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {Dimension} from '../../../../../dataLayer/model/projectData/layout/dimension';

export interface Animatable {
  startAnimation(xPosLocal: number, yPosLocal: number, zPosLocal: number, dimension: Dimension, component: Mesh): void;
}
