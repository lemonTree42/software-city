import {ProcessedComponent} from '../../../../dataLayer/model/projectData/processed/internal';

export class Row {
  constructor(
      public directionX: boolean,
      public areas: Area[],
  ) {}
}

export class Area {
  public childs: Row[] = [];

  constructor(
        private processedComponent: ProcessedComponent,
        private width: number,
        private length: number,
        private area?: number,
  ) {
  }

  public getWidth(): number {
    return this.width;
  }

  public setWidth(value: number) {
    this.width = value;
  }

  public getHeight(): number {
    return this.length;
  }

  public setHeight(value: number) {
    this.length = value;
  }

  public getWeight(): number {
    return this.processedComponent.getWeight();
  }

  public getProcessedComponent(): ProcessedComponent {
    return this.processedComponent;
  }
}
