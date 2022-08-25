import {Position} from '../position';
import {InvalidArgumentError} from '../../../../../utils/errorhandling/Errors';
import {FrontYard} from '../../processed/javaItems/returnObjectInterfaces';

export class BuildingFrontYard {
  constructor(
      public width: number,
      public height: number,
      public position: Position,
      public treeWidth: number,
  ) {
  }

  toDTO(): FrontYard {
    return {
      width: this.width,
      height: this.height,
      position: {
        x: this.position.X,
        y: this.position.Y,
      },
      treeWidth: this.treeWidth,
    };
  }

  public static fromDTO(dto: any): BuildingFrontYard {
    if (!BuildingFrontYard.canCreate(dto)) {
      throw new InvalidArgumentError('unable to create BuildingFrontYard from this DTO');
    }
    return new BuildingFrontYard(
        dto.width,
        dto.height,
        new Position(
            dto.position.x,
            dto.position.y,
        ),
        dto.treeWidth,
    );
  }

  private static canCreate(dto: any): boolean {
    return (dto.width !== undefined) &&
           (dto.height !== undefined) &&
           (dto.position !== undefined) &&
           (dto.position.x !== undefined) &&
           (dto.position.y !== undefined) &&
           (dto.treeWidth !== undefined);
  }
}
