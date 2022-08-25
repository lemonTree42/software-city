import {ProcessedComponent} from '../../dataLayer/model/projectData/processed/internal';
import {CityLayoutBuildStrategy} from './cityLayoutBuildStrategy';
import {CityLayoutSquarifiedTreemapStrategy} from './strategies/cityLayoutSquarifiedTreemapStrategy';
import {CityLayoutTreemapStrategy} from './strategies/cityLayoutTreemapStrategy';
import {LayoutingStrategy} from './strategies/strategies';

self.onmessage = async function(data) {
  let layoutStrategy: CityLayoutBuildStrategy;
  try {
    switch (data.data.strategy) {
      case LayoutingStrategy.simpleTreemap: layoutStrategy = new CityLayoutTreemapStrategy(); break;
      case LayoutingStrategy.squarifiedTreemap: layoutStrategy = new CityLayoutSquarifiedTreemapStrategy(); break;
      default: layoutStrategy = new CityLayoutSquarifiedTreemapStrategy();
    }
    const processed = ProcessedComponent.fromDTO(data.data.processedData);
    postMessage(layoutStrategy.build(processed).toDTO());
  } catch (error) {
    console.error(error);
    postMessage({error: error});
  }
};
