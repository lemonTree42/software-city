export class StateChangeError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export class InvalidCallError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export class InvalidArgumentError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export class DataContextError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export class DataRetrievalError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export class GithubApiError extends DataRetrievalError {
  constructor(public message: string) {
    super(message);
  }
}

export class ContentError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export class WebXrError extends Error {
  constructor(public message: string) {
    super(message);
  }
}
