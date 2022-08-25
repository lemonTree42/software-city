import {UnprocessedDirectory, UnprocessedFile} from '../../../../../src/dataLayer/model/projectData/unprocessed/internal';

describe('UnprocessedDirectory Test Suite', function() {
  let unprocessedDirectory: UnprocessedDirectory | null = null;
  beforeEach(() => {
    unprocessedDirectory = new UnprocessedDirectory('test_path');
  });
  test('should be constructable', () => {
    expect(unprocessedDirectory!['path']).toBe('test_path');
  });
  test('should be serializable with no content', () => {
    const expected = {directory: {path: 'test_path', content: []}};
    expect(unprocessedDirectory!.toDTO()).toStrictEqual(expected);
  });
  test('should be serializable with content', () => {
    const expected = {directory: {path: 'test_path', content: [{javaFile: {path: 'test', content: 'test'}}]}};
    const file = new UnprocessedFile('test', 'test');
    unprocessedDirectory!.addComponent(file);
    expect(unprocessedDirectory!.toDTO()).toStrictEqual(expected);
  });
  test('should be constructable from serialized object', () => {
    const serialized = {directory: {path: 'test_path', content: [{javaFile: {path: 'test', content: 'test'}}]}};
    const file = new UnprocessedFile('test', 'test');
    unprocessedDirectory!.addComponent(file);
    expect(UnprocessedDirectory.fromDTO(serialized)).toStrictEqual(unprocessedDirectory);
  });
  test('should return correct size of content', () => {
    const file1 = new UnprocessedFile('test1', 'test1');
    const file2 = new UnprocessedFile('test2', 'test2');
    unprocessedDirectory!.addComponent(file1);
    unprocessedDirectory!.addComponent(file2);
    expect(unprocessedDirectory!.getSize()).toEqual(2);
  });
});
