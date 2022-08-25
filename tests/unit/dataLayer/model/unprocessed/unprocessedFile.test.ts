import {UnprocessedFile} from '../../../../../src/dataLayer/model/projectData/unprocessed/internal';
import {InvalidCallError} from '../../../../../src/utils/errorhandling/Errors';

describe('UnprocessedFile Test Suite', function() {
  let unprocessedFile: UnprocessedFile | null = null;
  beforeEach(() => {
    unprocessedFile = new UnprocessedFile('test_path', 'test_content');
  });
  test('should be constructable', () => {
    expect(unprocessedFile!['content']).toBe('test_content');
    expect(unprocessedFile!['path']).toBe('test_path');
  });
  test('shouldn\'t allow to add a component', () => {
    const toAdd = new UnprocessedFile('test_path', 'test_content');
    expect(() => unprocessedFile!.addComponent(toAdd)).toThrow(InvalidCallError);
  });
  test('should be serializable', () => {
    const expected = {javaFile: {path: 'test_path', content: 'test_content'}};
    expect(unprocessedFile!.toDTO()).toStrictEqual(expected);
  });
  test('should be constructable from serialized object', () => {
    const serialized = {javaFile: {path: 'test_path', content: 'test_content'}};
    expect(UnprocessedFile.fromDTO(serialized)).toStrictEqual(unprocessedFile);
  });
});
