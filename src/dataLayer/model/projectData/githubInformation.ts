export class GithubInformation {
  private readonly time: number;

  constructor(
    private username: string,
    private repository: string,
  ) {
    this.time = new Date().getTime();
  }

  public getUsername(): string {
    return this.username;
  }

  public getRepository(): string {
    return this.repository;
  }

  public getProjectKey(): string {
    return `${this.username};${this.repository};${this.time}`;
  }
}
