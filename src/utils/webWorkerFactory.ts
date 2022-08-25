// @ts-nocheck
export class WebWorkerFactory {
  public static createJavaFileCollectorWorker(): Worker {
    return new Worker(new URL('../dataLayer/githubProxy/projectDataProxy.worker.ts', import.meta.url));
  }

  public static createJavaAnalyzerWorker(): Worker {
    return new Worker(new URL('../businessLogic/codeAnalyzer/javaAnalyzer.worker.ts', import.meta.url));
  }

  public static createLayoutBuildingWorker(): Worker {
    return new Worker(new URL('../businessLogic/cityLayoutBuilder/cityLayoutBuilder.worker.ts', import.meta.url));
  }
}
