import * as Core from './core';
import Glyph = require('./Glyph');

class Console {
  private _width: number;
  get width() {
    return this._width;
  }
  private _height: number;
  get height() {
    return this._height;
  }

  private _text: number[][];
  get text() {
    return this._text;
  }
  private _fore: Core.Color[][];
  get fore() {
    return this._fore;
  }
  private _back: Core.Color[][];
  get back() {
    return this._back;
  }
  private _isDirty: boolean[][];
  get isDirty() {
    return this._isDirty;
  }

  private defaultBackground: Core.Color;
  private defaultForeground: Core.Color;

  constructor(width: number, height: number, foreground: Core.Color = 0xffffff, background: Core.Color = 0x000000) {
    this._width = width;
    this._height = height;

    this.defaultBackground = 0x00000;
    this.defaultForeground = 0xfffff;

    this._text = Core.Utils.buildMatrix<number>(this.width, this.height, Glyph.CHAR_SPACE);
    this._fore = Core.Utils.buildMatrix<Core.Color>(this.width, this.height, this.defaultForeground);
    this._back = Core.Utils.buildMatrix<Core.Color>(this.width, this.height, this.defaultBackground);
    this._isDirty = Core.Utils.buildMatrix<boolean>(this.width, this.height, true);
  }

  cleanCell(x: number, y: number) {
    this._isDirty[x][y] = false;
  }

  print(text: string, x: number, y: number, color: Core.Color = 0xffffff) {
    let begin = 0;
    let end = text.length;
    if (x + end > this.width) {
      end = this.width - x;
    }
    if (x < 0) {
      end += x;
      x = 0;
    }
    this.setForeground(color, x, y, end, 1);
    for (let i = begin; i < end; ++i) {
      this.setText(text.charCodeAt(i), x + i, y);
    }
  }

  setText(ascii: number, x: number, y: number, width: number = 1, height: number = 1) {
    this.setMatrix(this._text, ascii, x, y, width, height);
  }

  setForeground(color: Core.Color, x: number, y: number, width: number = 1, height: number = 1) {
    this.setMatrix(this._fore, color, x, y, width, height);
  }

  setBackground(color: Core.Color, x: number, y: number, width: number = 1, height: number = 1) {
    this.setMatrix(this._back, color, x, y, width, height);
  }

  private setMatrix<T>(matrix: T[][], value: T, x: number, y: number, width: number, height: number) {
    for (let i = x; i < x + width; i++) {
      for (let j = y; j < y + height; j++) {
        if (matrix[i][j] === value) {
          continue;
        }
        matrix[i][j] = value;
        this._isDirty[i][j] = true;
      }
    }
  }
}

export = Console;
