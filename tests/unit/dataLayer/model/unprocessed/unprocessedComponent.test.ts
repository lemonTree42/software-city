import {UnprocessedComponent, UnprocessedDirectory, UnprocessedFile} from '../../../../../src/dataLayer/model/projectData/unprocessed/internal';
import {InvalidArgumentError} from '../../../../../src/utils/errorhandling/Errors';

describe('UnprocessedComponent Test Suite', function() {
  test('should be constructable from serialized object', () => {
    const serialized = {directory: {path: 'test_path', content: [{javaFile: {path: 'test', content: 'test'}},
      {directory: {path: 'test_path', content: [{javaFile: {path: 'test', content: 'test'}}]}}]}};
    const expected = new UnprocessedDirectory('test_path');
    const file1 = new UnprocessedFile('test', 'test');
    expected!.addComponent(file1);
    const subDirectory = new UnprocessedDirectory('test_path');
    const file2 = new UnprocessedFile('test', 'test');
    subDirectory!.addComponent(file2);
    expected!.addComponent(subDirectory);
    expect(UnprocessedComponent.fromDTO(serialized)).toEqual(expected);
  });
  test('shouldn\'t allow to construct from faulty serialized object', () => {
    const serialized = {directory: {path: 'test_path', content: [{faultyKey: {path: 'test', content: 'test'}}]}};
    expect(() => UnprocessedComponent.fromDTO(serialized)).toThrow(InvalidArgumentError);
  });
});
