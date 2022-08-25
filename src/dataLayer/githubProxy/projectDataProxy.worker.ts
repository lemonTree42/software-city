import {JavaFileCollector} from './javaFileCollector';
import {GithubApi} from './githubApi';

self.onmessage = async function(e) {
  try {
    const {username, repository} = e.data;
    const collector = new JavaFileCollector(username, repository, new GithubApi(), (state) => postMessage(state));
    const result = await collector.getData();
    postMessage(result);
  } catch (err) {
    postMessage({error: err});
  }
};
