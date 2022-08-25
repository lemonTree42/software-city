import {Metrics} from '../../../../../src/dataLayer/model/projectData/processed/internal';
import {
  Building,
  BuildingFrontYard,
  CityComponent,
  Position,
  Quarter,
} from '../../../../../src/dataLayer/model/projectData/layout/internal';
import {InvalidArgumentError} from '../../../../../src/utils/errorhandling/Errors';
import {Dimension} from '../../../../../src/dataLayer/model/projectData/layout/dimension';

describe('ProcessedComponent Test Suite', function() {
  const dto = {
    'quarter': {
      'position': {
        'x': 0,
        'y': 0,
      },
      'dimension': {
        'width': 10,
        'height': 10,
      },
      'depth': 0.001,
      'hidden': false,
      'name': 'package',
      'content': [
        {
          'building': {
            'name': 'Hotel',
            'hidden': false,
            'depth': 0.5,
            'dimension': {
              'width': 1,
              'height': 1,
            },
            'position': {
              'x': 0,
              'y': 0,
            },
            'type': 'JavaClass',
            'metrics': {
              'sourceCode': 'public class Hotel {}',
              'lineCount': 15,
              'methodCount': 3,
              'fieldCount': 1,
              'modifiers': [
                'public',
              ],
              'path': 'default',
              'containsMainMethod': false,
            },
            'frontYards': [{
              'width': 0.5,
              'height': 0.5,
              'position': {
                'x': 0,
                'y': 0,
              },
              'treeWidth': 0.02,
            }, {
              'width': 0.5,
              'height': 0.5,
              'position': {
                'x': 0,
                'y': 0,
              },
              'treeWidth': 0.02,
            }],
          },
        },
        {
          'building': {
            'name': 'Bulding',
            'hidden': false,
            'depth': 0.2,
            'dimension': {
              'width': 0.5,
              'height': 0.5,
            },
            'position': {
              'x': 1,
              'y': 1,
            },
            'type': 'JavaInterface',
            'metrics': {
              'sourceCode': 'interface Building {}',
              'lineCount': 1,
              'methodCount': 3,
              'fieldCount': 0,
              'modifiers': [],
              'path': 'default',
              'containsMainMethod': false,
            },
            'frontYards': [{
              'width': 0.5,
              'height': 0.5,
              'position': {
                'x': 0,
                'y': 0,
              },
              'treeWidth': 0.02,
            }, {
              'width': 0.5,
              'height': 0.5,
              'position': {
                'x': 0,
                'y': 0,
              },
              'treeWidth': 0.02,
            }],
          },
        },
        {
          'building': {
            'name': 'Weekdays',
            'hidden': false,
            'depth': 0.1,
            'dimension': {
              'width': 0.5,
              'height': 0.5,
            },
            'position': {
              'x': 3,
              'y': 3,
            },
            'type': 'JavaEnum',
            'metrics': {
              'sourceCode': 'public enum Weekdays {}',
              'lineCount': 3,
              'methodCount': 1,
              'fieldCount': 1,
              'modifiers': [
                'public',
              ],
              'path': 'default',
              'containsMainMethod': false,
            },
            'frontYards': [{
              'width': 0.5,
              'height': 0.5,
              'position': {
                'x': 0,
                'y': 0,
              },
              'treeWidth': 0.02,
            }, {
              'width': 0.5,
              'height': 0.5,
              'position': {
                'x': 0,
                'y': 0,
              },
              'treeWidth': 0.02,
            }],
          },
        },
      ],
    },
  };
  const faultyDTO = {
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
  const frontYard = new BuildingFrontYard(0.5, 0.5, new Position(0, 0), 0.02);
  const class1 = new Building(new Dimension( 1, 0.5, 1), false, 'Hotel', new Position(0, 0), 'JavaClass', metricsClass1, [frontYard, frontYard]);
  const metricsInterface = new Metrics('interface Building {}', 1, 3, 0, [], 'default', false);
  const interface1 = new Building(new Dimension(.5, .2, .5), false, 'Bulding', new Position(1, 1), 'JavaInterface', metricsInterface, [frontYard, frontYard]);
  const metricsEnum = new Metrics('public enum Weekdays {}', 3, 1, 1, ['public'], 'default', false);
  const enum1 = new Building(new Dimension( 0.5, 0.1, 0.5), false, 'Weekdays', new Position(3, 3), 'JavaEnum', metricsEnum, [frontYard, frontYard]);
  const quarter = new Quarter(new Dimension( 10, 0.001, 10), false, 'package', new Position(0, 0));
  quarter.addContent(class1);
  quarter.addContent(interface1);
  quarter.addContent(enum1);
  test('should be constructable from dto', () => {
    expect(CityComponent.fromDTO(dto)).toStrictEqual(quarter);
  });
  test('shouldn\'t allow to construct from faulty dto', () => {
    expect(() => CityComponent.fromDTO(faultyDTO)).toThrow(InvalidArgumentError);
  });
  test('should be convertible to dto', () => {
    expect(quarter.toDTO()).toEqual(dto);
  });
});
