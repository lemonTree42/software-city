import {JavaItem} from './internal';
import {Metrics} from './metrics';
import {JavaItemObject} from './returnObjectInterfaces';

export class JavaEnum extends JavaItem {
  public getClassCount(): number {
    return 0;
  }

  public getInterfaceCount(): number {
    return 0;
  }

  public getEnumCount(): number {
    return 1;
  }

  public toDTO(): JavaItemObject {
    return {
      enum: {
        name: this.name,
        metrics: this.metrics.toDTO().metrics,
      },
    };
  }

  public static fromDTO(dto: JavaItemObject): JavaEnum {
    const metrics = Metrics.fromDTO(dto.enum!.metrics);
    return new JavaEnum(dto.enum!.name, metrics);
  }
}
