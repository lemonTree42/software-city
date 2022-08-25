import {JavaPackage, JavaItem, Metrics} from './internal';
import {InvalidArgumentError} from '../../../../utils/errorhandling/Errors';

export abstract class ProcessedComponent {
  protected name: string;
  protected content: {[name: string]: ProcessedComponent} = {};

  protected constructor(name: string) {
    this.name = name;
  }

  public abstract addJavaItem(name: string, packages: string[], component: ProcessedComponent): void;

  public getName(): string {
    return this.name;
  }

  public abstract getContent(): ProcessedComponent[];

  public abstract getMetrics(): Metrics;

  public abstract getLineCount(): number;

  public abstract getMaxLineCount(): number;

  public abstract getMethodCount(): number;

  public abstract getWeight(): number;

  public abstract getPackageCount(): number;

  public abstract getClassCount(): number;

  public abstract getInterfaceCount(): number;

  public abstract getEnumCount(): number;

  public abstract getAverageLineWidth(): number;

  public abstract toDTO(): object;

  public static fromDTO(dto: any): ProcessedComponent {
    if (dto.package) {
      return JavaPackage.fromDTO(dto);
    } else if (dto.class || dto.interface || dto.enum) {
      return JavaItem.fromDTO(dto);
    }
    throw new InvalidArgumentError('unable create ProcessedComponent from this DTO');
  }
}
