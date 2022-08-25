import {
  JavaInterface,
  Metrics,
} from '../../../../../../src/dataLayer/model/projectData/processed/javaItems/internal';

describe('JavaInterface Test Suite', function() {
  const serialized = {
    'interface': {
      'name': 'Hotel',
      'metrics': {
        'sourceCode': 'interface Hotel {}',
        'lineCount': 15,
        'methodCount': 3,
        'fieldCount': 1,
        'modifiers': [''],
        'path': 'path',
        'containsMainMethod': false,
      },
    },
  };
  test('should allow to create javaInterface from serialized', () => {
    const metrics = new Metrics('interface Hotel {}', 15, 3, 1, [''], 'path', false);
    const javaInterface = new JavaInterface('Hotel', metrics);
    expect(JavaInterface.fromDTO(serialized)).toEqual(javaInterface);
  });
  test('should return 0 for class count', () => {
    expect(JavaInterface.fromDTO(serialized).getClassCount()).toEqual(0);
  });
  test('should return 1 for interface count', () => {
    expect(JavaInterface.fromDTO(serialized).getInterfaceCount()).toEqual(1);
  });
  test('should return 0 for enum count', () => {
    expect(JavaInterface.fromDTO(serialized).getEnumCount()).toEqual(0);
  });
});
