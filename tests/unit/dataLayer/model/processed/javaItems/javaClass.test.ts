import {
  JavaClass,
  Metrics,
} from '../../../../../../src/dataLayer/model/projectData/processed/javaItems/internal';

describe('JavaClass Test Suite', function() {
  const serialized = {
    'class': {
      'name': 'Hotel',
      'metrics': {
        'sourceCode': 'public class Hotel {}',
        'lineCount': 15,
        'methodCount': 3,
        'fieldCount': 1,
        'modifiers': ['public'],
        'path': 'path',
        'containsMainMethod': false,
      },
    },
  };
  test('should allow to create javaClass from serialized', () => {
    const metrics = new Metrics('public class Hotel {}', 15, 3, 1, ['public'], 'path', false);
    const javaClass = new JavaClass('Hotel', metrics);
    expect(JavaClass.fromDTO(serialized)).toEqual(javaClass);
  });
  test('should return 1 for class count', () => {
    expect(JavaClass.fromDTO(serialized).getClassCount()).toEqual(1);
  });
  test('should return 0 for interface count', () => {
    expect(JavaClass.fromDTO(serialized).getInterfaceCount()).toEqual(0);
  });
  test('should return 0 for enum count', () => {
    expect(JavaClass.fromDTO(serialized).getEnumCount()).toEqual(0);
  });
});
