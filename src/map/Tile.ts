import * as Core from '../core';
import * as Entities from '../entities';
import * as Map from './index';

export interface TileDescription {
  glyph: Map.Glyph | Map.Glyph[];
  walkable: boolean;
  blocksSight: boolean;
}

export class Tile {
  public glyph: Map.Glyph;
  public walkable: boolean;
  public blocksSight: boolean;
  public entity: Entities.Entity;
  public props: {[guid: string]: Entities.Entity};

  public static EMPTY: TileDescription = {
    glyph: new Map.Glyph(Map.Glyph.CHAR_SPACE, 0x000000, 0x000000),
    walkable: false,
    blocksSight: true,
  };

  public static FLOOR: TileDescription = {
    glyph: [
      new Map.Glyph('.', 0x3a4444, 0x222222),
      new Map.Glyph('.', 0x443a44, 0x222222),
      new Map.Glyph('.', 0x44443a, 0x222222),
      new Map.Glyph(',', 0x3a4444, 0x222222),
      new Map.Glyph(',', 0x443a44, 0x222222),
      new Map.Glyph(',', 0x44443a, 0x222222)
    ],
    walkable: true,
    blocksSight: false,
  };

  public static WALL: TileDescription = {
    glyph: new Map.Glyph(Map.Glyph.CHAR_BLOCK3, 0xdddddd, 0x111111),
    walkable: false,
    blocksSight: true,
  };

  constructor(glyph: Map.Glyph, walkable: boolean, blocksSight: boolean) {
    this.glyph = glyph;
    this.walkable = walkable;
    this.blocksSight = blocksSight;
    this.entity = null;
    this.props = {};
  }

  public static createTile(desc: TileDescription) {
    var g: Map.Glyph = null;
    if ((<Array<Map.Glyph>>desc.glyph).length && (<Array<Map.Glyph>>desc.glyph).length > 0) {
      g = <Map.Glyph>Core.Random.getRandomIndex(<Array<Map.Glyph>>desc.glyph);
    } else {
      g = <Map.Glyph>desc.glyph;
    }
    return new Tile(g, desc.walkable, desc.blocksSight);
  }
}
