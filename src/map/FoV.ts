import * as Core from '../core';

export class FoV {
  private visiblityCheck: (position: Core.Position) => boolean;
  private width: number;
  private height: number;
  private radius: number;
  
  private startPosition: Core.Position;
  private lightMap: number[][];

  constructor(visiblityCheck: (position: Core.Position) => boolean, width: number, height: number, radius: number) {
    this.visiblityCheck = visiblityCheck;
    this.width = width;
    this.height = height;
    this.radius = radius;
  }

  calculate(position: Core.Position) {
    this.startPosition = position;
    this.lightMap = Core.Utils.buildMatrix<number>(this.width, this.height, 0);

    if (!this.visiblityCheck(position)) {
      return this.lightMap;
    }

    this.lightMap[position.x][position.y] = 1;
    Core.Position.getDiagonalOffsets().forEach((offset) => {
      this.castLight(1, 1.0, 0.0, 0, offset.x, offset.y, 0);
      this.castLight(1, 1.0, 0.0, offset.x, 0, 0, offset.y);
    });

    return this.lightMap;
  }

  private castLight(row: number, start: number, end: number, xx: number, xy: number, yx: number, yy: number) {
    let newStart = 0;
    let blocked = false;

    if (start < end) {
      return;
    }

    for (let distance = row; distance <= this.radius && !blocked; distance++) {
      let deltaY = -distance;
      for (let deltaX = -distance; deltaX <= 0; deltaX++) {
        let cx = this.startPosition.x + (deltaX * xx) + (deltaY * xy);
        let cy = this.startPosition.y + (deltaX * yx) + (deltaY * yy);

        let leftSlope = (deltaX - 0.5) / (deltaY + 0.5);
        let rightSlope = (deltaX + 0.5) / (deltaY - 0.5);

        if (!(cx >= 0 && cy >= 0 && cx < this.width && cy < this.height) || start < rightSlope) {
          continue;
        } else if (end > leftSlope) {
          break;
        }

        let dist = Math.max(Math.abs(deltaX), Math.abs(deltaY));

        if (dist <= this.radius) {
          this.lightMap[cx][cy] = 1;
        }

        if (blocked) {
          if (!this.visiblityCheck(new Core.Position(cx, cy))) {
            newStart = rightSlope;
            continue;
          } else {
            blocked = false;
            start = newStart;
          }
        } else if (!this.visiblityCheck(new Core.Position(cx, cy)) && distance <= this.radius) {
          blocked = true;
          this.castLight(distance + 1, start, leftSlope, xx, xy, yx, yy);
          newStart = rightSlope;
        }
      }
    }

  }
}
