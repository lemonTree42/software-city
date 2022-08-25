import {GithubApiError} from '../../utils/errorhandling/Errors';

export class GithubApi {
  private readonly BASE_URL = 'https://api.github.com';
  // ADD GitHub API_Token(s) here ...
  private readonly GITHUB_ACCESS_TOKENS: string[] = [
    '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',
  ];
  private tokenIndex = 0;

  public async getLatestCommit(username: string, repository: string): Promise<Response> {
    return this.fetch(`/repos/${username}/${repository}/commits`);
  }

  public async getTree(username: string, repository: string, sha: string): Promise<Response> {
    return this.fetch(`/repos/${username}/${repository}/git/trees/${sha}`);
  }

  public async getBlob(username: string, repository: string, sha: string): Promise<Response> {
    return this.fetch(`/repos/${username}/${repository}/git/blobs/${sha}`);
  }

  private async fetch(endpoint: string): Promise<Response> {
    let response = await fetch(`${this.BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        Authorization: `token ${this.GITHUB_ACCESS_TOKENS[this.tokenIndex]}`,
        Accept: 'application/json',
      },
    });
    response = this.checkStatus(response);
    this.tokenIndex = (this.tokenIndex + 1) % this.GITHUB_ACCESS_TOKENS.length;
    return response.json();
  }

  private checkStatus(response: Response): Response {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else if (response.status === 403) {
      throw new GithubApiError('GitHub Token overused');
    } else if (response.status === 404) {
      throw new GithubApiError('We\'re unable to find your repository. Either it doesn\'t exist or it is private.');
    } else if (response.status === 409) {
      throw new GithubApiError('No commits found for this repository');
    } else {
      throw new GithubApiError('Failed to fetch GitHub: ' + response.statusText);
    }
  }
}
