import {Building, CityComponent, Position, Quarter, Street} from '../../../dataLayer/model/projectData/layout/internal';
import {JavaPackage, ProcessedComponent} from '../../../dataLayer/model/projectData/processed/internal';
import {Area, Row} from './areas/squarifiedArea';
import {CityLayoutBuildStrategy} from '../cityLayoutBuildStrategy';
import {BuildingFrontYard} from '../../../dataLayer/model/projectData/layout/cityItems/buildingFrontYard';
import {Dimension} from '../../../dataLayer/model/projectData/layout/dimension';

export class CityLayoutSquarifiedTreemapStrategy extends CityLayoutBuildStrategy {
  private maxLC: number = 0;
  private totalWeight?: number;
  private padding: number = 0.02;

  public build(project: ProcessedComponent): CityComponent {
    this.maxLC = project.getMaxLineCount();
    this.totalWeight = project.getWeight();
    this.padding = this.getStreetWidth(this.totalWeight);
    const result = [new Row(false, [])];
    this.squarify([...project.getContent()].sort((a, b) => b.getWeight() - a.getWeight()), result, 1, 1, this.totalWeight);
    return this.calculateAbsolutePosition(result, 0, 0, 1, 1, 'city', 1);
  }

  private calculateAbsolutePosition(rows: Row[], originX: number, originY: number, width: number, length: number, name: string, nestingDepth: number): Quarter {
    const quarter = new Quarter(new Dimension(width, 0, length), false, name, new Position(originX, originY));
    const cornerA = new Position(originX, originY);
    const cornerB = new Position(originX, originY+length);
    const cornerC = new Position(originX+width, originY+length);
    let offsetX = 0;
    let offsetY = 0;
    for (const row of rows) {
      const rowDirectionX = row.directionX;
      const areas = row.areas;
      let offsetRow = 0;
      for (const area of areas) {
        const pos = new Position(originX + offsetX + (rowDirectionX ? offsetRow : 0), originY + offsetY + (!rowDirectionX ? offsetRow : 0));
        const padding = this.padding;
        const item = this.createCityComponent(area.getProcessedComponent(), area, pos, rowDirectionX, nestingDepth, padding);
        quarter.addContent(item);
        const currentStreetWidth = padding-(padding/10)*nestingDepth+padding/10;
        this.addStreetDownside(pos, rowDirectionX, area, {cornerA, cornerB, cornerC}, currentStreetWidth, nestingDepth, quarter);
        this.addStreetLeftside(pos, rowDirectionX, area, {cornerA, cornerB, cornerC}, currentStreetWidth, nestingDepth, quarter);
        offsetRow += area.getHeight();
      }
      const updatedOffsets = this.getUpdatedOffsets(areas, rowDirectionX, offsetY, offsetX);
      offsetY = updatedOffsets.offsetY;
      offsetX = updatedOffsets.offsetX;
    }
    return quarter;
  }

  private getUpdatedOffsets(areas: Area[], rowDirectionX: boolean, offsetY: number, offsetX: number): {offsetY: number, offsetX: number} {
    const offset = areas.length > 0 ? areas[0].getWidth() : 0;
    if (rowDirectionX) {
      return {offsetY: offsetY + offset, offsetX};
    } else {
      return {offsetY, offsetX: offsetX + offset};
    }
  }

  private createCityComponent(component: ProcessedComponent, area: Area, pos: Position,
      rowDirectionX: boolean, nestingDepth: number, padding: number): CityComponent {
    if (component instanceof JavaPackage) {
      return this.calculateAbsolutePosition(area.childs, pos.X, pos.Y, rowDirectionX ? area.getHeight() : area.getWidth(),
          rowDirectionX ? area.getWidth() : area.getHeight(), component.getName(), nestingDepth + 1);
    } else {
      return this.createBuilding(component, area, pos, rowDirectionX, padding);
    }
  }

  private addStreetLeftside(pos: Position, rowDirectionX: boolean, area: Area, parentCorners: {cornerA: Position, cornerB: Position, cornerC: Position},
      currentStreetWidth: number, nestingDepth: number, quarter: Quarter): void {
    const cornerAStreetL = new Position(pos.X, pos.Y);
    const cornerBStreetL = new Position(pos.X, pos.Y + (rowDirectionX ? area.getWidth() : area.getHeight()));
    if (!this.streetIsOnEdgeOfArea(parentCorners.cornerA, parentCorners.cornerB, parentCorners.cornerC, cornerAStreetL, cornerBStreetL)) {
      const streetL = new Street(new Dimension(currentStreetWidth, this.getRandomDepth(nestingDepth), (rowDirectionX ? area.getWidth() : area.getHeight())),
          false, '', new Position(pos.X - currentStreetWidth / 2, pos.Y), nestingDepth);
      quarter.addContent(streetL);
    }
  }

  private addStreetDownside(pos: Position, rowDirectionX: boolean, area: Area, parentCorners: {cornerA: Position, cornerB: Position, cornerC: Position},
      currentStreetWidth: number, nestingDepth: number, quarter: Quarter): void {
    const cornerAStreetD = new Position(pos.X, pos.Y + (rowDirectionX ? area.getWidth() : area.getHeight()));
    const cornerBStreetD = new Position(pos.X + (rowDirectionX ? area.getHeight() : area.getWidth()),
        pos.Y + (rowDirectionX ? area.getWidth() : area.getHeight()));
    if (!this.streetIsOnEdgeOfArea(parentCorners.cornerA, parentCorners.cornerB, parentCorners.cornerC, cornerAStreetD, cornerBStreetD)) {
      const streetD = new Street(new Dimension((rowDirectionX ? area.getHeight() : area.getWidth()), this.getRandomDepth(nestingDepth), currentStreetWidth),
          false, '', rowDirectionX ? new Position(pos.X, pos.Y + area.getWidth() - currentStreetWidth / 2) :
              new Position(pos.X, pos.Y + area.getHeight() - currentStreetWidth / 2), nestingDepth);
      quarter.addContent(streetD);
    }
  }

  private createBuilding(c: ProcessedComponent, area: Area, pos: Position, rowDirectionX: any, padding: number): Building {
    const buildingWidth = Math.min(area.getHeight(), area.getWidth()) - padding;
    const rest = (Math.abs((area.getHeight()-padding) - (area.getWidth()-padding))) / 2;
    const widthBigger = area.getWidth() > area.getHeight();
    const x = pos.X + padding / 2 + (rowDirectionX && !widthBigger || !rowDirectionX && widthBigger ? rest : 0);
    const y = pos.Y + padding / 2 + (rowDirectionX && widthBigger || !rowDirectionX && !widthBigger ? rest : 0);
    const posWithPadding = new Position(x, y);
    const frontYards = this.createFrontYards(rowDirectionX, widthBigger, rest, area, buildingWidth, padding, new Position(x, y));
    return new Building(
        new Dimension(
            buildingWidth,
            CityLayoutBuildStrategy.EFFECTIVE_MAX_BUILDING_HEIGHT / this.maxLC * c.getMetrics().lineCount,
            buildingWidth,
        ),
        false,
        c.getName(),
        posWithPadding,
        c.constructor.name,
        c.getMetrics(),
        frontYards);
  }

  private createFrontYards(rowDirectionX: any, widthBigger: boolean, rest: number, area: Area,
      buildingWidth: number, padding: number, pos: Position): BuildingFrontYard[] {
    const frontYards: BuildingFrontYard[] = [];
    if (rowDirectionX && !widthBigger) {
      frontYards.push(new BuildingFrontYard(rest, area.getWidth() - padding, new Position(pos.X - rest, pos.Y), this.padding));
      frontYards.push(new BuildingFrontYard(rest, area.getWidth() - padding, new Position(pos.X + buildingWidth, pos.Y), this.padding));
    } else if (rowDirectionX && widthBigger) {
      frontYards.push(new BuildingFrontYard(area.getHeight() - padding, rest, new Position(pos.X, pos.Y - rest), this.padding));
      frontYards.push(new BuildingFrontYard(area.getHeight() - padding, rest, new Position(pos.X, pos.Y + buildingWidth), this.padding));
    } else if (!rowDirectionX && !widthBigger) {
      frontYards.push(new BuildingFrontYard(area.getWidth() - padding, rest, new Position(pos.X, pos.Y - rest), this.padding));
      frontYards.push(new BuildingFrontYard(area.getWidth() - padding, rest, new Position(pos.X, pos.Y + buildingWidth), this.padding));
    } else {
      frontYards.push(new BuildingFrontYard(rest, area.getHeight() - padding, new Position(pos.X - rest, pos.Y), this.padding));
      frontYards.push(new BuildingFrontYard(rest, area.getHeight() - padding, new Position(pos.X + buildingWidth, pos.Y), this.padding));
    }
    return frontYards;
  }

  private squarify(children: ProcessedComponent[], rows: Row[], shortSide: number, longSide: number, totalWeight: number): void {
    const current = children.shift();
    if (!current) {
      return;
    }
    const rowIndex = rows.length - 1;
    const row = rows[rowIndex];
    const rowWeight = this.getTotalWeight(row.areas) + current.getWeight();
    const rowArea = rowWeight / totalWeight;
    let rowWidth = rowArea / shortSide;
    let currentHeight = current.getWeight() / (totalWeight * rowWidth);
    let currentArea = new Area(current, rowWidth, currentHeight);
    const newRow = this.addAreaToRow(currentArea, row, rowWidth, totalWeight);
    const lastIndex = newRow.areas.length - 1;
    if (this.worst(row.areas) <= this.worst(newRow.areas)) {
      rows[rowIndex] = newRow;
      this.squarify(children, rows, shortSide, longSide, totalWeight);
      currentArea = rows[rowIndex].areas[lastIndex];
      currentHeight = currentArea.getHeight();
      rowWidth = currentArea.getWidth();
      const result = [new Row(rowWidth < currentHeight ? !newRow.directionX : newRow.directionX, [])];
      this.squarify([...current.getContent()].sort((a, b) => b.getWeight() - a.getWeight()), result,
          Math.min(rowWidth, currentHeight), Math.max(rowWidth, currentHeight), totalWeight);
      currentArea.childs = result;
    } else {
      const oldRowWeight = this.getTotalWeight(rows[rowIndex].areas);
      const oldRowArea = oldRowWeight / totalWeight;
      const oldRowWidth = oldRowArea / shortSide;
      const longSideRest = longSide - oldRowWidth;
      rows.push(new Row(shortSide < longSideRest ? row.directionX : !row.directionX, []));
      this.squarify([current, ...children], rows, Math.min(longSideRest, shortSide), Math.max(longSideRest, shortSide), totalWeight);
    }
  }

  private getStreetWidth(totalWeight: number): number {
    if (totalWeight<500) {
      return (-(0.07/460)*totalWeight+(29/230));
    } else if (totalWeight<1000) {
      return (-(0.025/500)*totalWeight+0.075);
    } else if (totalWeight<10000) {
      return (-(0.02/9000)*totalWeight+0.0272);
    } else {
      return 0.005;
    }
  }

  private addAreaToRow(component: Area, row: Row, rowWidth: number, totalWeight): Row {
    const newRow = new Row(row.directionX, []);
    for (const old of row.areas) {
      newRow.areas.push(new Area(old.getProcessedComponent(), rowWidth, old.getWeight() / (totalWeight * rowWidth)));
    }
    newRow.areas.push(component);
    return newRow;
  }

  private getTotalWeight(components: Area[]): number {
    return components.reduce((acc, c) => acc + c.getWeight(), 0);
  }

  private worst(row: Area[]): number {
    if (row.length === 0) {
      return 0;
    }
    return row.reduce((prev, current) => {
      const w = current.getWidth();
      const l = current.getHeight();
      const ratio = w > l ? l / w : w / l;
      if (ratio < prev) {
        return ratio;
      }
      return prev;
    }, 1);
  }

  protected getRandomDepth(depth: number): number {
    return Math.random() * (0.0005 / depth - 0.0005 / (depth + 1)) + 0.0005 / (depth + 1);
  }

  private streetIsOnEdgeOfArea(parentA: Position, parentB: Position, parentC: Position, streetA: Position, streetB: Position): boolean {
    const insideLeft = this.lineIsInsideParentLine(parentA, parentB, streetA, streetB);
    const insideRight = this.lineIsInsideParentLine(parentB, parentC, streetA, streetB);
    return insideLeft || insideRight;
  }

  private lineIsInsideParentLine(a1: Position, b1: Position, a2: Position, b2: Position): boolean {
    const a2Inside = this.equalFloats(this.distance(a1, a2) + this.distance(b1, a2), this.distance(a1, b1));
    const b2Inside = this.equalFloats(this.distance(a1, b2) + this.distance(b1, b2), this.distance(a1, b1));
    const smallerLineIsSmallerOrEquals = this.distance(a1, b1) >= this.distance(a2, b2) - 0.000001;
    return a2Inside && b2Inside && smallerLineIsSmallerOrEquals;
  }

  private distance(a: Position, b: Position): number {
    return a.distanceTo(b);
  }

  private equalFloats(f1: number, f2: number): boolean {
    return Math.abs(f1 - f2) < 0.00001;
  }
}
