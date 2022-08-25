import {GithubApi} from '../../../../src/dataLayer/githubProxy/githubApi';
import {GithubApiError} from '../../../../src/utils/errorhandling/Errors';

describe('GithubApi Test Suite', function() {
  let githubApi: GithubApi | null = null;
  const successResponse = {test: 'test'};
  beforeEach(() => {
    githubApi = new GithubApi();
    global.fetch = () => new Promise((res) => {
      res({
        status: 200,
        // @ts-ignore
        json: () => successResponse,
      });
    });
  });
  test('should return the response on getLatestCommit', async () => {
    const result = await githubApi!.getLatestCommit('test', 'test');
    expect(result).toEqual(successResponse);
  });
  test('should return the response on getTree', async () => {
    const result = await githubApi!.getTree('test', 'test', 'test');
    expect(result).toEqual(successResponse);
  });
  test('should return the response on getBlob', async () => {
    const result = await githubApi!.getBlob('test', 'test', 'test');
    expect(result).toEqual(successResponse);
  });
  test('should throw if status is bad', async () => {
    global.fetch = () => new Promise((res) => {
      res({
        status: 400,
        // @ts-ignore
        json: () => ({}),
      });
    });
    await expect(githubApi!.getLatestCommit('test', 'test')).rejects.toThrow(GithubApiError);
  });
});
