export class MissingComponentError extends Error {
  public name: string;
  public message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class MissingImplementationError extends Error {
  public name: string;
  public message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class EntityOverlapError extends Error {
  public name: string;
  public message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class CouldNotGenerateMap extends Error {
  public name: string;
  public message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}
