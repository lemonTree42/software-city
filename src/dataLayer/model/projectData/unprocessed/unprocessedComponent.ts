import {ProcessedComponent} from '../processed/processedComponent';
import {UnprocessedDirectory, UnprocessedFile} from './internal';
import {InvalidArgumentError} from '../../../../utils/errorhandling/Errors';

export abstract class UnprocessedComponent {
  protected path: string;

  protected constructor(path: string) {
    this.path = path;
  }

  public abstract addComponent(component: UnprocessedComponent): void;

  public abstract process(parse: Function, result: ProcessedComponent, errorCallback: Function): void;

  public abstract toDTO(): any;

  public abstract getFileCount(): number;

  public abstract getLineCount(): number;

  public static fromDTO(dto: any): UnprocessedComponent {
    if (dto.directory) {
      return UnprocessedDirectory.fromDTO(dto);
    } else if (dto.javaFile) {
      return UnprocessedFile.fromDTO(dto);
    }
    throw new InvalidArgumentError('unable create UnprocessedComponent from this DTO');
  }
}
