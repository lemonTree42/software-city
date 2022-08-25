export interface StateChangeObserver {
    updateState(newState: string, newStateIndex: number): void;
}

export interface BabylonJsLoadedObserver {
    updateBabylonJs(): void;
}
