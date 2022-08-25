import {JavaItem} from '../../../../../../src/dataLayer/model/projectData/processed/javaItems/internal';
import {InvalidArgumentError} from '../../../../../../src/utils/errorhandling/Errors';

describe('JavaItem Test Suite', function() {
  const serializedFaulty = {
    'invalidJavaObject': {
      'name': 'Hotel',
      'sourceCode': 'public class Hotel {}',
      'lineCount': 15,
      'methodCount': 3,
      'fieldCount': 1,
      'modifiers': ['public'],
      'content': [],
    },
  };
  test('should throw from invalid serialized object', () => {
    // @ts-ignore
    expect(() => JavaItem.fromDTO(serializedFaulty)).toThrow(InvalidArgumentError);
  });
});
