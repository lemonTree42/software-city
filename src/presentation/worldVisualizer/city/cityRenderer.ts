import {State} from '../../application/states/state';
import {DataContext} from '../../application/dataContext';
import {BabylonJsLoadedObserver} from '../../application/appObserver';
import {CommonStateStatus} from '../../application/states/stateStatus';

export class CityRenderer implements BabylonJsLoadedObserver {
  constructor(
    private stateContext: State,
    private dataContext: DataContext) {
  }

  public async initiateRendering(): Promise<void> {
    await this.ensureBabylonJsAvailableBeforeStart();
  }

  private async ensureBabylonJsAvailableBeforeStart(): Promise<void> {
    const appContext = this.stateContext.getAppContext();
    if (appContext.getBabylonJsController()) {
      await this.renderCity();
    } else {
      appContext.subscribeToBabylonJsLoaded(this);
      appContext.lazyLoadBabylonJs();
    }
  }

  public async updateBabylonJs(): Promise<void> {
    await this.renderCity();
  }

  private async renderCity(): Promise<void> {
    const appContext = this.stateContext.getAppContext();
    const world = appContext.getBabylonJsController().getWorld();
    world.removeCity();
    const module = await this.lazyLoadRenderer();
    let buildingRenderer; let frontYardRenderer; let carRenderer;
    if (this.dataContext.getConfig().renderSpecification.enhancedCity) {
      buildingRenderer = new module.BlenderBuildingRenderStrategy(world);
      frontYardRenderer = new module.TreeFrontYardRenderStrategy(world);
      carRenderer = new module.AnimatedCarRenderStrategy(world);
    } else {
      buildingRenderer = new module.BasicBuildingRenderStrategy(world);
      frontYardRenderer = new module.NullFrontYardRenderStrategy(world);
      carRenderer = new module.NullCarRenderStrategy(world);
    }
    const signRenderer = new module.SignRenderer(world, this.dataContext);
    const streetRenderer = new module.StreetRenderer(world);
    const objectRenderer = new module.SkullRenderer(world);
    const renderer = new module.CityComponentRenderer(world, buildingRenderer, frontYardRenderer, signRenderer, streetRenderer,
        objectRenderer, carRenderer, appContext.getDataContext().getConfig());
    const city = this.dataContext.getCityLayout();
    city.render(renderer);
    world.getSky().setCloudIndex();
    this.stateContext.finish(CommonStateStatus.success);
  }

  private async lazyLoadRenderer() {
    return import('./componentsRenderer/internal.lazy');
  }
}
