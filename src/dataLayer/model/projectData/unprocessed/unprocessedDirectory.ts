import {UnprocessedComponent} from './internal';
import {ProcessedComponent} from '../processed/processedComponent';

export class UnprocessedDirectory extends UnprocessedComponent {
  private content: UnprocessedComponent[] = [];

  constructor(path: string) {
    super(path);
  }

  public addComponent(component: UnprocessedComponent): void {
    this.content.push(component);
  }

  public process(parse: Function, result: ProcessedComponent, errorCallback: Function): void {
    this.content.forEach((c: UnprocessedComponent) => {
      c.process(parse, result, errorCallback);
    });
  }

  public getSize(): number {
    return this.content.length;
  }

  public getContent(): UnprocessedComponent[] {
    return this.content;
  }

  public getFileCount(): number {
    return this.content.reduce((acc: number, current: UnprocessedComponent) => acc + current.getFileCount(), 0);
  }

  public getLineCount(): number {
    return this.content.reduce((acc: number, current: UnprocessedComponent) => acc + current.getLineCount(), 0);
  }

  public toDTO(): object {
    const result: object[] = [];
    this.content.forEach((c: UnprocessedComponent) => {
      result.push(c.toDTO());
    });
    return {
      directory: {
        path: this.path,
        content: result,
      },
    };
  }

  public static fromDTO(dto: any): UnprocessedComponent {
    const result = new UnprocessedDirectory(dto.directory.path);
    dto.directory.content.forEach((c: any) => {
      result.addComponent(UnprocessedComponent.fromDTO(c));
    });
    return result;
  }
}
