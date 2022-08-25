import {GithubInformation} from '../../../../src/dataLayer/model/projectData/githubInformation';

describe('GithubInformation Test Suite', function() {
  let githubInformation: GithubInformation | null = null;
  beforeEach(() => {
    githubInformation = new GithubInformation('username', 'repository');
  });
  test('should allow to get username', () => {
    expect(githubInformation!.getUsername()).toBe('username');
  });
  test('should allow to get repository', () => {
    expect(githubInformation!.getRepository()).toBe('repository');
  });
  test('should allow to get project key', () => {
    const mockDate = new Date(1466424490000);
    // @ts-ignore
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    const expected = `username;repository;${mockDate.getTime()}`;
    githubInformation = new GithubInformation('username', 'repository');
    expect(githubInformation!.getProjectKey()).toBe(expected);
  });
});
