/// <reference path='../typings/index.d.ts' />

import * as Core from './core';

import Glyph = require('./Glyph');
import Console = require('./Console');

class PixiConsole {
  private _width: number;
  private _height: number;

  private canvasId: string;
  private text: number[][];
  private fore: Core.Color[][];
  private back: Core.Color[][];
  private isDirty: boolean[][];

  private renderer: any;
  private stage: PIXI.Container;

  private loaded: boolean;

  private charWidth: number;
  private charHeight: number;

  private font: PIXI.BaseTexture;
  private chars: PIXI.Texture[];

  private foreCells: PIXI.Sprite[][];
  private backCells: PIXI.Sprite[][];

  private defaultBackground: Core.Color;
  private defaultForeground: Core.Color;

  private canvas: any;
  private topLeftPosition: Core.Position;

  constructor(width: number, height: number, canvasId: string, foreground: Core.Color = 0xffffff, background: Core.Color = 0x000000) {
    this._width = width;
    this._height = height;

    this.canvasId = canvasId;

    this.loaded = false;
    this.stage = new PIXI.Container();

    this.loadFont();
    this.defaultBackground = 0x00000;
    this.defaultForeground = 0xfffff;

    this.text = Core.Utils.buildMatrix<number>(this.width, this.height, Glyph.CHAR_SPACE);
    this.fore = Core.Utils.buildMatrix<Core.Color>(this.width, this.height, this.defaultForeground);
    this.back = Core.Utils.buildMatrix<Core.Color>(this.width, this.height, this.defaultBackground);
    this.isDirty = Core.Utils.buildMatrix<boolean>(this.width, this.height, true);
  }

  get height(): number {
    return this._height;
  }

  get width(): number {
    return this._width;
  }

  private loadFont() {
    let fontUrl = './Talryth_square_15x15.png';
    this.font = PIXI.BaseTexture.fromImage(fontUrl, false, PIXI.SCALE_MODES.NEAREST);
    if (this.font.hasLoaded) {
      this.onFontLoaded();
    } else {
      this.font.on('loaded', this.onFontLoaded.bind(this));
    }
  }

  private onFontLoaded() {
    this.charWidth = this.font.width / 16;
    this.charHeight = this.font.height / 16;

    this.initCanvas();
    this.initCharacterMap();
    this.initBackgroundCells();
    this.initForegroundCells();
    this.loaded = true;
  }

  private initCanvas() {
    let canvasWidth = this.width * this.charWidth;
    let canvasHeight = this.height * this.charHeight;

    this.canvas = document.getElementById(this.canvasId);

    let pixiOptions = {
      antialias: false,
      clearBeforeRender: false,
      preserveDrawingBuffer: false,
      resolution: 1,
      transparent: false,
      backgroundColor: Core.ColorUtils.toNumber(this.defaultBackground),
      view: this.canvas
    };
    this.renderer = PIXI.autoDetectRenderer(canvasWidth, canvasHeight, pixiOptions);
    this.renderer.backgroundColor = Core.ColorUtils.toNumber(this.defaultBackground);
    this.topLeftPosition = new Core.Position(this.canvas.offsetLeft, this.canvas.offsetTop);
  }

  private initCharacterMap() {
    this.chars = [];
    for ( let x = 0; x < 16; x++) {
      for ( let y = 0; y < 16; y++) {
        let rect = new PIXI.Rectangle(x * this.charWidth, y * this.charHeight, this.charWidth, this.charHeight);
        this.chars[x + y * 16] = new PIXI.Texture(this.font, rect);
      }
    }
  }

  private initBackgroundCells() {
    this.backCells = [];
    for ( let x = 0; x < this.width; x++) {
      this.backCells[x] = [];
      for ( let y = 0; y < this.height; y++) {
        let cell = new PIXI.Sprite(this.chars[Glyph.CHAR_FULL]);
        cell.position.x = x * this.charWidth;
        cell.position.y = y * this.charHeight;
        cell.width = this.charWidth;
        cell.height = this.charHeight;
        cell.tint = Core.ColorUtils.toNumber(this.defaultBackground);
        this.backCells[x][y] = cell;
        this.stage.addChild(cell);
      }
    }
  }

  private initForegroundCells() {
    this.foreCells = [];
    for (let x = 0; x < this.width; x++) {
      this.foreCells[x] = [];
      for (let y = 0; y < this.height; y++) {
        let cell = new PIXI.Sprite(this.chars[Glyph.CHAR_SPACE]);
        cell.position.x = x * this.charWidth;
        cell.position.y = y * this.charHeight;
        cell.width = this.charWidth;
        cell.height = this.charHeight;
        cell.tint = Core.ColorUtils.toNumber(this.defaultForeground);
        this.foreCells[x][y] = cell;
        this.stage.addChild(cell);
      }
    }
  }

  addGridOverlay(x: number, y: number, width: number, height: number) {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        let cell = new PIXI.Graphics();
        cell.lineStyle(1, 0x444444, 0.5);
        cell.beginFill(0, 0);
        cell.drawRect((i + x) * this.charWidth, (j + y) * this.charHeight, this.charWidth, this.charHeight);
        this.stage.addChild(cell);
      }
    }
  }

  addBorder(x: number, y: number, width: number, height: number) {
    let cell = new PIXI.Graphics();
    cell.lineStyle(1, 0x444444, 0.5);
    cell.beginFill(0, 0);
    cell.drawRect(x * this.charWidth, y * this.charHeight, x * width * this.charWidth, y * height * this.charHeight);
    this.stage.addChild(cell);
  }

  render() {
    if (this.loaded) {
      this.renderer.render(this.stage);
    }
  }

  blit(console: Console, offsetX: number = 0, offsetY: number = 0, forceDirty: boolean = false) {
    if (!this.loaded) {
      return false;
    }
    for (let x = 0; x < console.width; x++) {
      for (let y = 0; y < console.height; y++) {
        if (forceDirty || console.isDirty[x][y]) {
          let ascii = console.text[x][y];
          let px = offsetX + x;
          let py = offsetY + y;
          if (ascii > 0 && ascii <= 255) {
            this.foreCells[px][py].texture = this.chars[ascii];
          }
          this.foreCells[px][py].tint = Core.ColorUtils.toNumber(console.fore[x][y]);
          this.backCells[px][py].tint = Core.ColorUtils.toNumber(console.back[x][y]);
          console.cleanCell(x, y);
        }
      }
    }
  }

  getPositionFromPixels(x: number, y: number) : Core.Position {
    if (!this.loaded) {
      return new Core.Position(-1, -1);
    } 
    let dx: number = x - this.topLeftPosition.x;
    let dy: number = y - this.topLeftPosition.y;
    let rx = Math.floor(dx / this.charWidth);
    let ry = Math.floor(dy / this.charHeight);
    return new Core.Position(rx, ry);
  }
}

export = PixiConsole;
