import {MetricsObject} from './returnObjectInterfaces';
import {InvalidArgumentError} from '../../../../../utils/errorhandling/Errors';

export class Metrics {
  constructor(
    public sourceCode: string,
    public lineCount: number,
    public methodCount: number,
    public fieldCount: number,
    public modifiers: string[],
    public path: string,
    public containsMainMethod: boolean ) {
  }

  public toDTO(): MetricsObject {
    return {
      metrics: {
        sourceCode: this.sourceCode,
        lineCount: this.lineCount,
        methodCount: this.methodCount,
        fieldCount: this.fieldCount,
        modifiers: this.modifiers,
        path: this.path,
        containsMainMethod: this.containsMainMethod,
      },
    };
  }

  public static fromDTO(dto: any): Metrics {
    if (!Metrics.canCreate(dto)) {
      throw new InvalidArgumentError('unable to create Metrics from this DTO');
    }
    return new Metrics(
        dto.sourceCode,
        dto.lineCount,
        dto.methodCount,
        dto.fieldCount,
        dto.modifiers,
        dto.path,
        dto.containsMainMethod);
  }

  private static canCreate(dto: any): boolean {
    return (dto.sourceCode !== undefined) &&
           (dto.lineCount !== undefined) &&
           (dto.methodCount !== undefined) &&
           (dto.fieldCount !== undefined) &&
           (dto.modifiers !== undefined) &&
           (dto.path !== undefined) &&
           (dto.containsMainMethod !== undefined);
  }
}
