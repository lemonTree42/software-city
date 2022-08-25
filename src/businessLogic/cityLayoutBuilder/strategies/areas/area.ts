import {Position} from '../../../../dataLayer/model/projectData/layout/internal';

export class Area {
    private position: Position;

    constructor(private p: Position, private width: number, private height: number) {
      this.position = p;
    }

    public getArea(): number {
      return this.getWidth() * this.getHeight();
    }

    public getWidth(): number {
      return this.width;
    }

    public getHeight(): number {
      return this.height;
    }

    public moveX(width: number) : Area {
      this.position.X += width;
      this.width -= width;
      return this;
    }

    public moveY(height: number): Area {
      this.position.Y += height;
      this.height -= height;
      return this;
    }

    public cut(width: number, height: number): Area {
      this.moveX(width);
      this.moveY(height);
      return this;
    }

    public getPosition(): Position {
      return this.position;
    }
}
