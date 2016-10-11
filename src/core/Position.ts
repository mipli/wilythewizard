export class Position {
  private _x: number;
  private _y: number;

  private static maxWidth: number;
  private static maxHeight: number;

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  public toString() {
    return this._x + ', ' + this._y;
  }

  public static equals(a: Position, b: Position) {
    return a.x === b.x && a.y === b.y;
  }

  public static setMaxValues(w: number, h: number) {
    Position.maxWidth = w;
    Position.maxHeight = h;
  }

  public static getRandom(width: number = -1, height: number = -1): Position {
    if (width === -1) {
      width = Position.maxWidth;
    }
    if (height === -1) {
      height = Position.maxHeight;
    }
    var x = Math.floor(Math.random() * width);
    var y = Math.floor(Math.random() * height);
    return new Position(x, y);
  }

  public static getNeighbours(pos: Position, width: number = -1, height: number = -1, onlyCardinal: boolean = false): Position[] {
    if (width === -1) {
      width = Position.maxWidth;
    }
    if (height === -1) {
      height = Position.maxHeight;
    }
    let x = pos.x;
    let y = pos.y;
    let positions = [];
    if (x > 0) {
      positions.push(new Position(x - 1, y));
    }
    if (x < width - 1) {
      positions.push(new Position(x + 1, y));
    }
    if (y > 0) {
      positions.push(new Position(x, y - 1));
    }
    if (y < height - 1) {
      positions.push(new Position(x, y + 1));
    }
    if (!onlyCardinal) {
      if (x > 0 && y > 0) {
        positions.push(new Position(x - 1, y - 1));
      }
      if (x > 0 && y < height - 1) {
        positions.push(new Position(x - 1, y + 1));
      }
      if (x < width - 1 && y < height - 1) {
        positions.push(new Position(x + 1, y + 1));
      }
      if (x < width - 1 && y > 0) {
        positions.push(new Position(x + 1, y - 1));
      }
    }
    return positions;

  }

  public static getDirections(onlyCardinal: boolean = false): Position[] {
    let directions: Position[] = [];

    directions.push(new Position( 0, -1));
    directions.push(new Position( 0,  1));
    directions.push(new Position(-1,  0));
    directions.push(new Position( 1,  0));
    if (!onlyCardinal) {
      directions.push(new Position(-1, -1));
      directions.push(new Position( 1,  1));
      directions.push(new Position(-1,  1));
      directions.push(new Position( 1, -1));
    }

    return directions;
  }

  public static add(a: Position, b: Position) {
    return new Position(a.x + b.x, a.y + b.y);
  }

  public static getDiagonalOffsets() {
    return [
      {x: -1, y: -1}, {x:  1, y:  -1},
      {x: -1, y:  1}, {x:  1, y:  1}
    ]
  }
}
