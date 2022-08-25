import {Dimension} from '../../../../../dataLayer/model/projectData/layout/dimension';
import {Building, Position, Street} from '../../../../../dataLayer/model/projectData/layout/internal';

export interface ICityComponentRenderer {
    renderBuilding(name: string, position: Position, dimension: Dimension, backReference: Building, buildingType: string): void;
    renderStreet(name: string, position: Position, dimension: Dimension, backReference: Street, nestingDepth: number): void;
    renderBuildingFrontYard(name: string, position: Position, xDim: number, zDim: number,
                            treeWidth: number, rotatedFrontYards: boolean, frontYardIndex: number): void;
}
