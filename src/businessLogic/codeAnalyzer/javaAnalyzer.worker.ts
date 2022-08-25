import {UnprocessedComponent} from '../../dataLayer/model/projectData/unprocessed/internal';
import {JavaPackage} from '../../dataLayer/model/projectData/processed/internal';
import {parse} from 'java-parser';

self.onmessage = async function(e) {
  try {
    const unprocessed = UnprocessedComponent.fromDTO(e.data);
    const result = new JavaPackage('');
    unprocessed.process(parse, result, (data) => postMessage(data));
    postMessage(result.toDTO());
  } catch (error) {
    console.error(error);
    postMessage({error: error});
  }
};
