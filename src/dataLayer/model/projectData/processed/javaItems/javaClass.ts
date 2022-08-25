import {JavaItem} from './internal';
import {Metrics} from './metrics';
import {JavaItemObject} from './returnObjectInterfaces';

export class JavaClass extends JavaItem {
  public getClassCount(): number {
    return 1;
  }

  public getInterfaceCount(): number {
    return 0;
  }

  public getEnumCount(): number {
    return 0;
  }

  public toDTO(): JavaItemObject {
    return {
      class: {
        name: this.name,
        metrics: this.metrics.toDTO().metrics,
      },
    };
  }

  public static fromDTO(dto: JavaItemObject): JavaClass {
    const metrics = Metrics.fromDTO(dto.class!.metrics);
    return new JavaClass(dto.class!.name, metrics);
  }
}
