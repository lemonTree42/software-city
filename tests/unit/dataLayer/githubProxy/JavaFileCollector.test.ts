// @ts-nocheck
import {JavaFileCollector} from '../../../../src/dataLayer/githubProxy/javaFileCollector';
import {UnprocessedFile} from '../../../../src/dataLayer/model/projectData/unprocessed/unprocessedFile';
import {UnprocessedDirectory} from '../../../../src/dataLayer/model/projectData/unprocessed/unprocessedDirectory';

describe('JavaFileCollector Test Suite', function() {
  let javaFileCollector: JavaFileCollector | null = null;
  const githubApiMock = {
    getLatestCommit: () => new Promise((res, rej) => {
      res([{commit: {tree: {sha: 'supertree'}}}]);
    }),
    getTree: () => new Promise((res, rej) => {
      res({tree: [{type: 'blob', path: 'test.java', sha: '1234'}]});
    }),
    getBlob: () => new Promise((res, rej) => {
      res({content: 'content'});
    }),
  };
  beforeEach(() => {
    javaFileCollector = new JavaFileCollector('test', 'test', githubApiMock, () => {});
    global.self = {};
    global.window = {atob: () => 'content'};
  });
  test('should be able to read one file', async () => {
    const expected = new UnprocessedDirectory('/');
    const file = new UnprocessedFile('test.java', 'content');
    expected.addComponent(file);
    const result = await javaFileCollector!.getData();
    expect(result).toStrictEqual(expected.toDTO());
  });
  test('should be able to read hierarchy', async () => {
    githubApiMock.getTree = (user, repo, path) => new Promise((res, rej) => {
      if (path === 'supertree') {
        res({tree: [
          {type: 'blob', path: 'test1.java', sha: '1234'},
          {type: 'tree', path: 'subdir', sha: 'subtree'},
        ]});
      } else if (path === 'subtree') {
        res({tree: [{type: 'blob', path: 'test2.java', sha: '5678'}]});
      }
    });
    const expected = new UnprocessedDirectory('/');
    const file1 = new UnprocessedFile('test1.java', 'content');
    expected.addComponent(file1);
    const subdir = new UnprocessedDirectory('subdir');
    const file2 = new UnprocessedFile('test2.java', 'content');
    subdir.addComponent(file2);
    expected.addComponent(subdir);
    const result = await javaFileCollector!.getData();
    expect(result).toStrictEqual(expected.toDTO());
  });
  test('should ignore non java files', async () => {
    githubApiMock.getTree = (user, repo, path) => new Promise((res, rej) => {
      res({tree: [
        {type: 'blob', path: 'test.java', sha: '1234'},
        {type: 'blob', path: 'bla.txt', sha: '5678'},
      ]});
    });
    const expected = new UnprocessedDirectory('/');
    const file = new UnprocessedFile('test.java', 'content');
    expected.addComponent(file);
    const result = await javaFileCollector!.getData();
    expect(result).toStrictEqual(expected.toDTO());
  });
});
