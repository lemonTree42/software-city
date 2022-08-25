import {AbstractMesh} from '@babylonjs/core';

export interface IControllerInitObserver {
    onControllerLoaded(left: AbstractMesh | undefined, right: AbstractMesh | undefined): void;
}
