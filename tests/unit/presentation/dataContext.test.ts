import {DataContext} from '../../../src/presentation/application/dataContext';
import {ProjectData} from '../../../src/dataLayer/model/projectData/projectData';
import {GithubInformation} from '../../../src/dataLayer/model/projectData/githubInformation';
import {DataContextError} from '../../../src/utils/errorhandling/Errors';
import {AppConfig} from '../../../src/dataLayer/model/configuration/internal';

class DataContextTest extends DataContext {
  // @ts-ignore
  protected createProjectData() {
    return new ProjectData();
  }

  protected createAppConfig() {
    return new AppConfig();
  }
}

describe('DataContext Test Suite', function() {
  let dataContext: DataContextTest | null = null;
  let dateSpy: any;
  beforeEach(() => {
    dataContext = new DataContextTest();
    const mockDate = new Date(1466424490000);
    dateSpy = jest
        .spyOn(global, 'Date')
        // @ts-ignore
        .mockImplementation(() => mockDate);
  });
  afterEach(() => {
    dateSpy.mockRestore();
  });
  test('should allow to set and get GithubInformation', () => {
    expect(dataContext!.getGithubInformation()).toBeNull();
    dataContext!.setGithubInformation('test', 'test');
    expect(dataContext!.getGithubInformation()).toEqual(new GithubInformation('test', 'test'));
  });
  test('should throw if no UnprocessedProject available', () => {
    expect(() => dataContext!.getUnprocessedProject()).toThrow(DataContextError);
  });
  test('should allow to set and get UnprocessedProject', () => {
    dataContext!.setGithubInformation('test', 'test');
    // @ts-ignore
    dataContext!.setUnprocessedProject({test: 1});
    expect(dataContext!.getUnprocessedProject()).toEqual({test: 1});
  });
  test('should throw if no ProcessedProject available', () => {
    expect(() => dataContext!.getProcessedProject()).toThrow(DataContextError);
  });
  test('should allow to set and get ProcessedProject', () => {
    dataContext!.setGithubInformation('test', 'test');
    // @ts-ignore
    dataContext!.setProcessedProject({test: 1});
    expect(dataContext!.getProcessedProject()).toEqual({test: 1});
  });
  test('should throw if no CityComponent available', () => {
    expect(() => dataContext!.getCityLayout()).toThrow(DataContextError);
  });
  test('should allow to set and get CityComponent', () => {
    // @ts-ignore
    dataContext!.setCityLayout({test: 1});
    expect(dataContext!.getCityLayout()).toEqual({test: 1});
  });
});
