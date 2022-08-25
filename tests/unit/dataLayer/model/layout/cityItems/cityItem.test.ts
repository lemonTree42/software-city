import {InvalidArgumentError} from '../../../../../../src/utils/errorhandling/Errors';
import {CityItem} from '../../../../../../src/dataLayer/model/projectData/layout/internal';

describe('CityItem Test Suite:', function() {
  const faultyDTO = {
    'invalidCityObject': { },
  };
  test('should throw from invalid DTO', () => {
    // @ts-ignore
    expect(() => CityItem.fromDTO(faultyDTO)).toThrow(InvalidArgumentError);
  });
});
