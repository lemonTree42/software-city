import {ContentError, InvalidArgumentError} from '../../../../../utils/errorhandling/Errors';
import {CityComponent} from '../internal';
import {Building, Street} from './internal';
import {CityItemObject} from './cityItemsInterfaces';

export abstract class CityItem extends CityComponent {
  public addContent(newContent: CityComponent): void {
    throw new ContentError('can not add content to a CityItem!');
  }

  public static fromDTO(dto: CityItemObject): CityItem {
    if (dto.building) {
      return Building.fromDTO(dto);
    } else if (dto.street) {
      return Street.fromDTO(dto);
    }
    throw new InvalidArgumentError('unable create CityItem from this DTO');
  }
  public isHidden(visible: boolean) {
    this.hidden = visible;
  }
}
