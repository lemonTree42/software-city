import {parse} from 'java-parser';
import {JavaPackage, ProcessedComponent} from '../../../../src/dataLayer/model/projectData/processed/internal';
import {MetricsCollector} from '../../../../src/businessLogic/codeAnalyzer/metricsCollector';

const javaFileClass = `
public class Hotel {
  private int capacity;

  public Hotel(int capacity) {
    this.capacity = capacity;
  }
  public void bookRoom(int amount) {
    capacity -= amount;
  }
  public int getCapacity() {
    return capacity;
  }
}`;

const javaFileInterface = `
interface Animal {
  public void animalSound();
  public void run();
}`;

const javaFileEnum = `
enum Level {
  LOW,
  MEDIUM,
  HIGH;private int capacity;
}`;

const javaFilePackage = `
package p1.p2;

enum Level {
  LOW,
}`;

describe('MetricsCollector Test Suite', function() {
  test.only('should collect metrics from class correctly', async () => {
    const cst = parse(javaFileClass);
    const expectedJSON = JSON.parse('{"package":{"name":"base","content":[{"package":{"name":"default","content":[{"class":{"name":"Hotel",' +
      '"metrics":{"sourceCode":"public class Hotel {\\n  private int capacity;\\n\\n  public Hotel(int capacity) {\\n    this.capacity = capacity;\\n  }\\n' +
      '  public void bookRoom(int amount) {\\n    capacity -= amount;\\n  }\\n  public int getCapacity() {\\n    return capacity;\\n  }\\n}",' +
      '"lineCount":13,"methodCount":3,"fieldCount":1,"modifiers":["public"],"path":"default","containsMainMethod":false}}}]}}]}}');
    const expected = ProcessedComponent.fromDTO(expectedJSON);
    const result = new JavaPackage('base');
    const collector = new MetricsCollector(result, javaFileClass);
    collector.visit(cst);
    expect(result).toEqual(expected);
  });
  test.only('should collect metrics from interface correctly', async () => {
    const cst = parse(javaFileInterface);
    const expectedJSON = JSON.parse('{"package":{"name":"base","content":[{"package":{"name":"default","content":[{"interface":{"name":"Animal' +
      '","metrics":{"sourceCode":"interface Animal {\\n  public void animalSound();\\n  public void run();\\n}","lineCount":4,"methodCount":2,"fieldCount":0,' +
      '"modifiers":[],"path":"default","containsMainMethod":false}}}]}}]}}');
    const expected = ProcessedComponent.fromDTO(expectedJSON);
    const result = new JavaPackage('base');
    const collector = new MetricsCollector(result, javaFileInterface);
    collector.visit(cst);
    expect(result).toEqual(expected);
  });
  test.only('should collect metrics from enum correctly', async () => {
    const cst = parse(javaFileEnum);
    const expectedJSON = JSON.parse('{"package":{"name":"base","content":[{"package":{"name":"default","content":[{"enum":{"name":"Level",' +
      '"metrics":{"sourceCode":"enum Level {\\n  LOW,\\n  MEDIUM,\\n  HIGH;private int capacity;\\n}","lineCount":5,"methodCount":0,"fieldCount":0,' +
      '"modifiers":[],"path":"default","containsMainMethod":false}}}]}}]}}');
    const expected = ProcessedComponent.fromDTO(expectedJSON);
    const result = new JavaPackage('base');
    const collector = new MetricsCollector(result, javaFileEnum);
    collector.visit(cst);
    expect(result).toEqual(expected);
  });
  test.only('should collect metrics from package hierarchy correctly', async () => {
    const cst = parse(javaFilePackage);
    const expectedJSON = JSON.parse('{"package":{"name":"base","content":[{"package":{"name":"p1","content":[{"package":{"name":"p2","content":' +
      '[{"enum":{"name":"Level","metrics":{"sourceCode":"enum Level {\\n  LOW,\\n}","lineCount":3,"methodCount":0,"fieldCount":0,"modifiers":[],' +
      '"path":"p1.p2","containsMainMethod":false}}}]}}]}}]}}');
    const expected = ProcessedComponent.fromDTO(expectedJSON);
    const result = new JavaPackage('base');
    const collector = new MetricsCollector(result, javaFilePackage);
    collector.visit(cst);
    expect(result).toEqual(expected);
  });
});
