import {ProcessedComponent, JavaItem, Metrics} from './internal';
import {JavaItemObject, JavaPackageObject} from './javaItems/returnObjectInterfaces';

export class JavaPackage extends ProcessedComponent {
  constructor(name: string) {
    super(name);
  }

  public addJavaItem(name: string, packagePath: string[], component: ProcessedComponent): void {
    if (packagePath.length > 0) {
      const currentPackage = packagePath.shift()!;
      this.ensureSubPackage(currentPackage);
      this.content[currentPackage].addJavaItem(name, packagePath, component);
      return;
    }
    this.content[name] = component;
  }

  public getContent(): ProcessedComponent[] {
    return Object.values(this.content);
  }

  private ensureSubPackage(name: string): void {
    if (!this.content[name]) {
      this.content[name] = new JavaPackage(name);
    }
  }

  public getMetrics(): Metrics {
    const result: Metrics = new Metrics('these are the metrics of a java package', 0, 0, 0, [], this.name, false);
    for (const c of this.getContent()) {
      result.lineCount += c.getMetrics().lineCount;
      result.methodCount += c.getMetrics().methodCount;
      result.fieldCount += c.getMetrics().fieldCount;
    }
    return result;
  }

  public getLineCount(): number {
    return Object.values(this.content).reduce((acc, e) => acc + e.getLineCount(), 0);
  }

  public getMaxLineCount(): number {
    let max = 0;
    for (const c of Object.values(this.content)) {
      if (c instanceof JavaPackage) {
        max = c.getMaxLineCount() > max ? c.getMaxLineCount(): max;
      } else if (c instanceof JavaItem) {
        max = c.getLineCount() > max ? c.getLineCount(): max;
      }
    }
    return max;
  }

  public getMethodCount(): number {
    return Object.values(this.content).reduce((acc, e) => acc + e.getMethodCount(), 0);
  }

  public getWeight(): number {
    return Object.values(this.content).reduce((acc, e) => acc + e.getWeight(), 0);
  }

  public getPackageCount(): number {
    return Object.values(this.content).reduce((acc, current) => acc + current.getPackageCount(), this.getName()===''?0:1);
  }

  public getClassCount(): number {
    return Object.values(this.content).reduce((acc, current) => acc + current.getClassCount(), 0);
  }

  public getInterfaceCount(): number {
    return Object.values(this.content).reduce((acc, current) => acc + current.getInterfaceCount(), 0);
  }

  public getEnumCount(): number {
    return Object.values(this.content).reduce((acc, current) => acc + current.getEnumCount(), 0);
  }

  public getAverageLineWidth(): number {
    const lineWidths = Object.values(this.content).reduce((acc, current) => acc + current.getAverageLineWidth(), 0);
    return lineWidths / Object.values(this.content).length;
  }

  public toDTO(): JavaPackageObject {
    const result: JavaItemObject[] = [];
    for (const c of Object.values(this.content)) {
      result.push(c.toDTO());
    }
    return {
      package: {
        name: this.name,
        content: result,
      },
    };
  }

  public static fromDTO(dto: JavaPackageObject): JavaPackage {
    const javaPackage = new JavaPackage(dto.package.name);
    dto.package.content.forEach((c: any) => {
      const item = ProcessedComponent.fromDTO(c);
      javaPackage.content[item.getName()] = item;
    });
    return javaPackage;
  }
}
