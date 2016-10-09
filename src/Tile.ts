import * as Core from './core';
import * as Entities from './entities';

import Glyph = require('./Glyph');

interface TileDescription {
  glyph: Glyph | Glyph[];
  walkable: boolean;
  blocksSight: boolean;
}

class Tile {
  public glyph: Glyph;
  public walkable: boolean;
  public blocksSight: boolean;
  public entity: Entities.Entity;
  public props: {[guid: string]: Entities.Entity};

  public static EMPTY: TileDescription = {
    glyph: new Glyph(Glyph.CHAR_SPACE, 0x000000, 0x000000),
    walkable: false,
    blocksSight: true,
  };

  public static FLOOR: TileDescription = {
    glyph: [
      new Glyph('.', 0x3a4444, 0x222222),
      new Glyph('.', 0x443a44, 0x222222),
      new Glyph('.', 0x44443a, 0x222222),
      new Glyph(',', 0x3a4444, 0x222222),
      new Glyph(',', 0x443a44, 0x222222),
      new Glyph(',', 0x44443a, 0x222222)
    ],
    walkable: true,
    blocksSight: false,
  };

  public static WALL: TileDescription = {
    glyph: new Glyph(Glyph.CHAR_HLINE, 0xdddddd, 0x111111),
    walkable: false,
    blocksSight: true,
  };

  constructor(glyph: Glyph, walkable: boolean, blocksSight: boolean) {
    this.glyph = glyph;
    this.walkable = walkable;
    this.blocksSight = blocksSight;
    this.entity = null;
    this.props = {};
  }

  public static createTile(desc: TileDescription) {
    var g: Glyph = null;
    if ((<Array<Glyph>>desc.glyph).length && (<Array<Glyph>>desc.glyph).length > 0) {
      g = <Glyph>Core.Utils.getRandomIndex(<Array<Glyph>>desc.glyph);
    } else {
      g = <Glyph>desc.glyph;
    }
    return new Tile(g, desc.walkable, desc.blocksSight);
  }
}

export = Tile;
