import {ProcessedComponent} from '../internal';
import {JavaClass, JavaEnum, JavaInterface} from './internal';
import {Metrics} from './metrics';
import {InvalidArgumentError} from '../../../../../utils/errorhandling/Errors';
import {JavaItemObject} from './returnObjectInterfaces';

export abstract class JavaItem extends ProcessedComponent {
  constructor(
      name: string,
      protected metrics: Metrics) {
    super(name);
  }

  public addJavaItem(name: string, packages: string[], component: ProcessedComponent): void {
    this.content[name] = component;
  }

  public getMetrics(): Metrics {
    return this.metrics;
  }

  public getLineCount(): number {
    return this.metrics.lineCount;
  }

  public getMaxLineCount(): number {
    return this.metrics.lineCount;
  }

  public getMethodCount(): number {
    return this.metrics.methodCount;
  }

  public getWeight(): number {
    const slope = 0.8;
    const lowest = 5;
    return slope * this.getMethodCount() + lowest;
  }

  public getPackageCount(): number {
    return 0;
  }

  public getContent(): ProcessedComponent[] {
    return [];
  }

  public getAverageLineWidth(): number {
    return this.metrics.sourceCode.length / this.metrics.lineCount;
  }

  public static fromDTO(dto: JavaItemObject): JavaItem {
    if (dto.class) {
      return JavaClass.fromDTO(dto);
    } else if (dto.interface) {
      return JavaInterface.fromDTO(dto);
    } else if (dto.enum) {
      return JavaEnum.fromDTO(dto);
    }
    throw new InvalidArgumentError('unable create ProcessedComponent from this DTO');
  }
}
