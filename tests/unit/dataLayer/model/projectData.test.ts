import {ProjectData} from '../../../../src/dataLayer/model/projectData/projectData';
import {GithubInformation} from '../../../../src/dataLayer/model/projectData/githubInformation';
import {UnprocessedDirectory} from '../../../../src/dataLayer/model/projectData/unprocessed/unprocessedDirectory';
import {DataContextError, InvalidCallError} from '../../../../src/utils/errorhandling/Errors';

describe('ProjectData Test Suite', function() {
  let projectData: ProjectData | null = null;
  beforeEach(() => {
    projectData = new ProjectData();
  });
  describe('GithubInformation Test Suite', function() {
    test('shouldn\'t contain GithubInformation at start', () => {
      expect(projectData!.getGithubInformation()).toBeNull();
    });
    test('should allow to set and get GithubInformation', () => {
      const github = new GithubInformation('username', 'repository');
      projectData!.setGithubInformation(github);
      expect(projectData!.getGithubInformation()).toEqual(github);
    });
  });
  describe('UnprocessedComponent Test Suite', function() {
    test('should throw if UnprocessedComponent doesn\'t match projectKey', () => {
      expect(() => projectData!.getUnprocessed()).toThrow(DataContextError);
    });
    test('should throw if no GithubInformation is available on setUnprocessed', () => {
      const data = new UnprocessedDirectory('test');
      expect(() => projectData!.setUnprocessed(data)).toThrow(InvalidCallError);
    });
    test('should update correct key in latestData on setUnprocessed', () => {
      const testProjectKey = 'testProjectKey';
      const expected = [testProjectKey, '', ''];
      const github = new GithubInformation('username', 'repository');
      jest.spyOn(github, 'getProjectKey').mockImplementation(() => testProjectKey);
      const data = new UnprocessedDirectory('test');
      projectData!.setGithubInformation(github);
      projectData!.setUnprocessed(data);
      expect(projectData!['latestData']).toEqual(expected);
    });
    test('should allow to set and get GithubInformation', () => {
      const github = new GithubInformation('username', 'repository');
      const data = new UnprocessedDirectory('test');
      projectData!.setGithubInformation(github);
      projectData!.setUnprocessed(data);
      expect(projectData!.getUnprocessed()).toEqual(data);
    });
  });
});
