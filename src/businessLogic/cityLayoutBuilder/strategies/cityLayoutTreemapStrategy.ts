import {CityComponent, Quarter, Position, Building, Street} from '../../../dataLayer/model/projectData/layout/internal';
import {ProcessedComponent, JavaPackage} from '../../../dataLayer/model/projectData/processed/internal';
import {Area} from './areas/area';
import {CityLayoutBuildStrategy} from '../cityLayoutBuildStrategy';
import {Dimension} from '../../../dataLayer/model/projectData/layout/dimension';

export class CityLayoutTreemapStrategy extends CityLayoutBuildStrategy {
  private maxLC: number = 0;
  private city: CityComponent | undefined;

  public build(project: ProcessedComponent): CityComponent {
    this.maxLC = project.getMaxLineCount();
    this.city = new Quarter(new Dimension(1, 0, 1), false, project.getName(), new Position(0, 0));
    const layout = this.calculateLayout(project, new Area(new Position(0, 0), 1, 1), 1);
    this.city.addContent(layout);
    return this.city;
  }

  private calculateLayout(processedPackage: ProcessedComponent, area: Area, depth: number): CityComponent {
    const thisPackage = new Quarter(new Dimension(area.getWidth(), 0, area.getHeight()), false, processedPackage.getName(), area.getPosition());
    const items = this.getComponentsSorted(processedPackage);
    const subAreas = this.splitArea(items, area, depth);

    for (let i = 0; i < items.length; i++) {
      if (items[i] instanceof JavaPackage) {
        thisPackage.addContent(this.calculateLayout(items[i], subAreas[i], depth + 1));
      } else {
        thisPackage.addContent(this.calculateBuilding(items[i], subAreas[i], depth));
      }
    }
    return thisPackage;
  }

  private calculateBuilding(c: ProcessedComponent, area: Area, depth: number): Building {
    const size: number = ((area.getWidth() <= area.getHeight()) ? area.getWidth() * 0.8 : area.getHeight() * 0.8) - (this.STREET_WIDTH / depth);
    const x = area.getPosition().X + area.getWidth() / 2 - size / 2;
    const y = area.getPosition().Y + area.getHeight() / 2 - size / 2;
    const pos = new Position(x, y);
    return new Building(new Dimension(size, 0.7 / this.maxLC * c.getMetrics().lineCount, size), false, '', pos, c.constructor.name, c.getMetrics(), []);
  }

  private calculateStreets(area: Area, depth: number): void {
    const width = this.STREET_WIDTH / depth;
    const p = area.getPosition();
    this.city?.addContent(new Street(new Dimension(width, 0.001, area.getHeight()), false, 'street', p, depth));
    this.city?.addContent(new Street(new Dimension(area.getWidth(), 0.001, width), false, 'street', p, depth));
    this.city?.addContent(new Street(new Dimension(width, 0.001, area.getHeight()), false, 'street', new Position(p.X + area.getWidth() - width, p.Y), depth));
    this.city?.addContent(new Street(new Dimension(area.getWidth(), 0.001, width), false, 'street', new Position(p.X, p.Y + area.getHeight() - width), depth));
  }

  private splitArea(processedPackage: ProcessedComponent[], area: Area, depth: number): Area[] {
    let tempArea = new Area(new Position(area.getPosition().X, area.getPosition().Y), area.getWidth(), area.getHeight());
    const tempPackage: ProcessedComponent[] = [];
    for (const p of processedPackage) {
      tempPackage.push(p);
    }
    let weightedArr = this.getWeightedArr(tempPackage);
    const areas: Area[] = [];
    while (weightedArr.length > 1) {
      const sum = weightedArr.reduce((s, v) => s + v, 0);
      for (let i = 0; i < weightedArr.length; i++) {
        weightedArr[i] /= sum;
      }
      if (tempArea.getWidth() >= tempArea.getHeight()) {
        areas.push(new Area(new Position(tempArea.getPosition().X, tempArea.getPosition().Y), tempArea.getWidth() * weightedArr[0], tempArea.getHeight()));
        const newP = new Position(tempArea.getPosition().X + tempArea.getWidth() * weightedArr[0], tempArea.getPosition().Y);
        tempArea = new Area(newP, tempArea.getWidth() * (1 - weightedArr[0]), tempArea.getHeight());
      } else {
        areas.push(new Area(new Position(tempArea.getPosition().X, tempArea.getPosition().Y), tempArea.getWidth(), tempArea.getHeight() * weightedArr[0]));
        const newP = new Position(tempArea.getPosition().X, tempArea.getPosition().Y + tempArea.getHeight() * weightedArr[0]);
        tempArea = new Area(newP, tempArea.getWidth(), tempArea.getHeight() * (1 - weightedArr[0]));
      }
      this.calculateStreets(tempArea, depth);
      tempPackage.shift();
      weightedArr = this.getWeightedArr(tempPackage);
    }
    areas.push(tempArea);
    this.calculateStreets(tempArea, depth);
    return areas;
  }

  private getComponentsSorted(processedPackage: ProcessedComponent): ProcessedComponent[] {
    const items = processedPackage.getContent();
    if (items.length < 2) {
      return items;
    }
    items.sort((x, y) => {
      return y.getMetrics().lineCount - x.getMetrics().lineCount; // sorted in descending order (biggest Element in at the beginning)
    });
    return items;
  }

  private getWeightedArr(items: ProcessedComponent[]): number[] {
    if (items.length < 2) {
      return [1];
    }
    const weightedArr: number[] = [];
    for (const item of items) {
      weightedArr.push(item.getMetrics().lineCount);
    }
    return weightedArr;
  }
}
