import {JavaItem} from './internal';
import {Metrics} from './metrics';
import {JavaItemObject} from './returnObjectInterfaces';

export class JavaInterface extends JavaItem {
  public getClassCount(): number {
    return 0;
  }

  public getInterfaceCount(): number {
    return 1;
  }

  public getEnumCount(): number {
    return 0;
  }

  public toDTO(): JavaItemObject {
    return {
      interface: {
        name: this.name,
        metrics: this.metrics.toDTO().metrics,
      },
    };
  }

  public static fromDTO(dto: JavaItemObject): JavaInterface {
    const metrics = Metrics.fromDTO(dto.interface!.metrics);
    return new JavaInterface(dto.interface!.name, metrics);
  }
}
