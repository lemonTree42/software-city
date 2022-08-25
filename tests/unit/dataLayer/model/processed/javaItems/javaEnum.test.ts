import {
  JavaEnum,
  Metrics,
} from '../../../../../../src/dataLayer/model/projectData/processed/javaItems/internal';

describe('JavaEnum Test Suite', function() {
  const serialized = {
    'enum': {
      'name': 'Hotel',
      'metrics': {
        'sourceCode': 'public enum Hotel {}',
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
    const metrics = new Metrics('public enum Hotel {}', 15, 3, 1, ['public'], 'path', false);
    const javaEnum = new JavaEnum('Hotel', metrics);
    expect(JavaEnum.fromDTO(serialized)).toEqual(javaEnum);
  });
  test('should return 0 for class count', () => {
    expect(JavaEnum.fromDTO(serialized).getClassCount()).toEqual(0);
  });
  test('should return 0 for interface count', () => {
    expect(JavaEnum.fromDTO(serialized).getInterfaceCount()).toEqual(0);
  });
  test('should return 1 for enum count', () => {
    expect(JavaEnum.fromDTO(serialized).getEnumCount()).toEqual(1);
  });
});
