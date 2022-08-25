import {
  JavaClass, JavaEnum, JavaInterface,
  JavaPackage,
  ProcessedComponent,
} from '../../../../../src/dataLayer/model/projectData/processed/internal';
import {Metrics} from '../../../../../src/dataLayer/model/projectData/processed/javaItems/metrics';
import {InvalidArgumentError} from '../../../../../src/utils/errorhandling/Errors';

describe('ProcessedComponent Test Suite', function() {
  const serialized = {
    'package': {
      'name': '',
      'content': [{
        'package': {
          'name': 'default',
          'content': [
            {
              'class': {
                'name': 'Hotel',
                'metrics': {
                  'sourceCode': 'public class Hotel {}',
                  'lineCount': 15,
                  'methodCount': 3,
                  'fieldCount': 1,
                  'modifiers': ['public'],
                  'path': 'default',
                  'containsMainMethod': false,
                },
              },
            },
            {
              'interface': {
                'name': 'Building',
                'metrics': {
                  'sourceCode': 'interface Building {}',
                  'lineCount': 1,
                  'methodCount': 3,
                  'fieldCount': 0,
                  'modifiers': [],
                  'path': 'default',
                  'containsMainMethod': false,
                },
              },
            },
          ],
        },
      }, {
        'package': {
          'name': 'p1',
          'content': [{
            'enum': {
              'name': 'Weekdays',
              'metrics': {
                'sourceCode': 'public enum Weekdays {}',
                'lineCount': 3,
                'methodCount': 1,
                'fieldCount': 1,
                'modifiers': ['public'],
                'path': 'default',
                'containsMainMethod': false,
              },
            },
          }],
        },
      }],
    },
  };
  const serializedFaulty = {
    'package': {
      'name': '',
      'content': [{
        'faultyPackage': {
          'name': 'default',
          'content': [{
            'class': {
              'name': 'Hotel',
              'sourceCode': 'public class Hotel {}',
              'lineCount': 15,
              'methodCount': 3,
              'fieldCount': 1,
              'modifiers': ['public'],
              'content': [],
            },
          }],
        },
      }],
    },
  };
  const metricsClass1 = new Metrics('public class Hotel {}', 15, 3, 1, ['public'], 'default', false);
  const class1 = new JavaClass('Hotel', metricsClass1);
  const metricsInterface = new Metrics('interface Building {}', 1, 3, 0, [], 'default', false);
  const interface1 = new JavaInterface('Building', metricsInterface);
  const metricsEnum = new Metrics('public enum Weekdays {}', 3, 1, 1, ['public'], 'default', false);
  const enum1 = new JavaEnum('Weekdays', metricsEnum);
  const pBase = new JavaPackage('');
  pBase.addJavaItem('Hotel', ['default'], class1);
  pBase.addJavaItem('Building', ['default'], interface1);
  pBase.addJavaItem('Weekdays', ['p1'], enum1);
  test('should be constructable from serialized object', () => {
    expect(ProcessedComponent.fromDTO(serialized)).toEqual(pBase);
  });
  test('shouldn\'t allow to construct from faulty serialized object', () => {
    expect(() => ProcessedComponent.fromDTO(serializedFaulty)).toThrow(InvalidArgumentError);
  });
  test('should be convertible to serialized object', () => {
    expect(pBase.toDTO()).toEqual(serialized);
  });
});
