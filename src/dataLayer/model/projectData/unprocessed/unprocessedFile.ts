import {InvalidCallError} from '../../../../utils/errorhandling/Errors';
import {UnprocessedComponent} from './internal';
import {MetricsCollector} from '../../../../businessLogic/codeAnalyzer/metricsCollector';
import {ProcessedComponent} from '../processed/processedComponent';

export class UnprocessedFile extends UnprocessedComponent {
  private readonly content: string;

  constructor(path: string, content: string) {
    super(path);
    this.content = content;
  }

  public addComponent(component: UnprocessedComponent): void {
    throw new InvalidCallError('can\'t add here');
  }

  public process(parse: Function, result: ProcessedComponent, errorCallback: Function): void {
    try {
      const cst = parse(this.content);
      const collector = new MetricsCollector(result, this.content);
      collector.visit(cst);
    } catch (e) {
      console.error(`Failed to parse ${this.path}. Skipping it.`);
      errorCallback({fileParseError: {name: this.path}});
    }
  }

  public getFileCount(): number {
    return 1;
  }

  public getLineCount(): number {
    return this.content.split(/\r\n|\r|\n/).length;
  }

  public toDTO(): object {
    return {
      javaFile: {
        path: this.path,
        content: this.content,
      },
    };
  }

  public static fromDTO(dto: any): UnprocessedComponent {
    return new UnprocessedFile(dto.javaFile.path, dto.javaFile.content);
  }
}
