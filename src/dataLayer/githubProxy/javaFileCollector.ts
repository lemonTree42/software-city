import {UnprocessedComponent, UnprocessedDirectory, UnprocessedFile} from '../model/projectData/unprocessed/internal';
import {GithubApi} from './githubApi';

export class JavaFileCollector {
    private javaFileRegex = /^.*\.java$/;
    private filesRead: number = 0;
    private linesRead: number = 0;

    constructor(
        private username: string,
        private repository: string,
        private githubApi: GithubApi,
        private statusUpdateCallback: Function,
    ) {
    }

    public async getData(): Promise<object> {
      const commit = await this.githubApi.getLatestCommit(this.username, this.repository);
      const sha = commit[0].commit.tree.sha;
      const unprocessedProject = await this.readDirectory(sha, '/');
      return unprocessedProject.toDTO();
    }

    private async readDirectory(treeHash: string, directory: string): Promise<UnprocessedComponent> {
      const result = new UnprocessedDirectory(directory);
      const tree = await this.getTree(treeHash);
      for (const file of tree) {
        if (file.type === 'blob' && this.javaFileRegex.test(file.path)) {
          const blob = await this.getBlob(file.sha);
          const fileContent = this.base64ToUtf8(blob.content);
          const unprocessedFile = new UnprocessedFile(file.path, fileContent);
          result.addComponent(unprocessedFile);
          this.linesRead += fileContent.split(/\r\n|\r|\n/).length;
          this.statusUpdateCallback({statusUpdate: {filesRead: ++this.filesRead, linesRead: this.linesRead}});
        } else if (file.type === 'tree') {
          const subDirectory = <UnprocessedDirectory> await this.readDirectory(file.sha, file.path);
          if (subDirectory.getSize()>0) {
            result.addComponent(subDirectory);
          }
        }
      }
      return result;
    }

    private async getTree(hash: string): Promise<any[]> {
      const response = await this.githubApi.getTree(this.username, this.repository, hash);
      return (response as any).tree;
    }

    private async getBlob(hash): Promise<any> {
      return this.githubApi.getBlob(this.username, this.repository, hash);
    }

    private base64ToUtf8(str: string): string {
      if (typeof window != 'object') {
        // @ts-ignore
        self.window = self;
      }
      return decodeURIComponent(escape(window.atob(str)));
    }
}
