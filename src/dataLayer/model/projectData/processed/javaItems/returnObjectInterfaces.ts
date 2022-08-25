export interface JavaPackageObject {
  package: {
    name: string,
    content: JavaItemObject[],
  }
}

export interface JavaItemObject {
  class?: {
    name: string,
    metrics: Metrics,
  },
  interface?: {
    name: string,
    metrics: Metrics,
  },
  enum?: {
    name: string,
    metrics: Metrics,
  }
}

export interface MetricsObject {
  metrics: Metrics,
}

export interface Metrics {
  sourceCode: string,
  lineCount: number,
  methodCount: number,
  fieldCount: number,
  modifiers: string[],
  path: string,
  containsMainMethod: boolean,
}

export interface FrontYard {
  width: number,
  height: number,
  position: {
    x: number,
    y: number,
  },
  treeWidth: number,
}
