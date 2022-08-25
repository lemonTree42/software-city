/* eslint-disable */
export enum CommonStateStatus {
  success='common_success',
  error='common_error',
  cancel='common_cancel',
}

export enum IdleStateStatus {
}

export enum DataRetrievalStateStatus {
  usingDTO = 'using_DTO',

}

export enum ParsingStateStatus {
  bla='parsing_bla',
}

export enum LayoutBuildingStateStatus {
}

export enum RenderingStateStatus {
}

export enum DisplayingStateStatus {
  settingsChanged='settingsChanged',
}

export type StateStatus =
    CommonStateStatus |
    IdleStateStatus |
    DataRetrievalStateStatus |
    ParsingStateStatus |
    LayoutBuildingStateStatus |
    RenderingStateStatus |
    DisplayingStateStatus;
