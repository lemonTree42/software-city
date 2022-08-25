import {Area} from '../../../../../../src/businessLogic/cityLayoutBuilder/strategies/areas/area';
import {Position} from '../../../../../../src/dataLayer/model/projectData/layout/position';

// @ts-nocheck
describe('Area Test Suite:', () => {
  let pos: Position = new Position(0, 0);
  let area: Area = new Area(pos, 10, 10);
  beforeEach(() => {
    pos = new Position(0, 0);
    area = new Area(pos, 10, 10);
  });
  test.only('should return Position', () => {
    expect(pos).toEqual(area.getPosition());
  });
  test.only('should return Area', () => {
    expect(100).toEqual(area.getArea());
  });
  test.only('should return Width and Height', () => {
    expect(10).toEqual(area.getWidth());
    expect(10).toEqual(area.getHeight());
  });
  test.only('should move Area X', () => {
    area.moveX(5);
    expect(5).toEqual(area.getPosition().X);
    expect(5).toEqual(area.getWidth());
  });
  test.only('should move Area Y', () => {
    area.moveY(5);
    expect(5).toEqual(area.getPosition().Y);
    expect(5).toEqual(area.getHeight());
  });
  test.only('should cut Area', () => {
    area.cut(4, 5);
    expect(4).toEqual(area.getPosition().X);
    expect(5).toEqual(area.getPosition().Y);
    expect(6).toEqual(area.getWidth());
    expect(5).toEqual(area.getHeight());
  });
});
