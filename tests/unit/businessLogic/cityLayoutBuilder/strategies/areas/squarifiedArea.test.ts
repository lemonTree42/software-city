import {JavaClass, Metrics} from '../../../../../../src/dataLayer/model/projectData/processed/internal';
import {Area} from '../../../../../../src/businessLogic/cityLayoutBuilder/strategies/areas/squarifiedArea';

// @ts-nocheck
describe('Area Test Suite:', () => {
  const metrics: Metrics = new Metrics('source code', 100, 5, 3, ['public'], 'default', false);
  const javaClass: JavaClass = new JavaClass('JavaClass', metrics);
  let area: Area = new Area(javaClass, 10, 10);
  beforeEach(() => {
    area = new Area(new JavaClass('JavaClass', metrics), 10, 10);
  });
  test.only('should return Weight', () => {
    expect(9).toEqual(area.getWeight());
  });
  test.only('should return Width and Height', () => {
    expect(10).toEqual(area.getWidth());
    expect(10).toEqual(area.getHeight());
  });
  test.only('should set Width', () => {
    area.setWidth(5);
    expect(5).toEqual(area.getWidth());
  });
  test.only('should set Height', () => {
    area.setHeight(5);
    expect(5).toEqual(area.getHeight());
  });
  test.only('should return Processed Component', () => {
    expect(javaClass).toEqual(area.getProcessedComponent());
  });
});
