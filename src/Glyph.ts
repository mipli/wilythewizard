import * as Core from './core';

class Glyph {
	public static CHAR_FULL: number = 219;
	public static CHAR_SPACE: number = 32;
	// single walls
	public static CHAR_HLINE: number = 196;
	public static CHAR_VLINE: number = 179;
	public static CHAR_SW: number = 191;
	public static CHAR_SE: number = 218;
	public static CHAR_NW: number = 217;
	public static CHAR_NE: number = 192;
	public static CHAR_TEEW: number = 180;
	public static CHAR_TEEE: number = 195;
	public static CHAR_TEEN: number = 193;
	public static CHAR_TEES: number = 194;
	public static CHAR_CROSS: number = 197;
	// double walls
	public static CHAR_DHLINE: number = 205;
	public static CHAR_DVLINE: number = 186;
	public static CHAR_DNE: number = 187;
	public static CHAR_DNW: number = 201;
	public static CHAR_DSE: number = 188;
	public static CHAR_DSW: number = 200;
	public static CHAR_DTEEW: number = 185;
	public static CHAR_DTEEE: number = 204;
	public static CHAR_DTEEN: number = 202;
	public static CHAR_DTEES: number = 203;
	public static CHAR_DCROSS: number = 206;
	// blocks 
	public static CHAR_BLOCK1: number = 176;
	public static CHAR_BLOCK2: number = 177;
	public static CHAR_BLOCK3: number = 178;
	// arrows 
	public static CHAR_ARROW_N: number = 24;
	public static CHAR_ARROW_S: number = 25;
	public static CHAR_ARROW_E: number = 26;
	public static CHAR_ARROW_W: number = 27;
	// arrows without tail 
	public static CHAR_ARROW2_N: number = 30;
	public static CHAR_ARROW2_S: number = 31;
	public static CHAR_ARROW2_E: number = 16;
	public static CHAR_ARROW2_W: number = 17;
	// double arrows 
	public static CHAR_DARROW_H: number = 29;
	public static CHAR_DARROW_V: number = 18;
	// GUI stuff 
	public static CHAR_CHECKBOX_UNSET: number = 224;
	public static CHAR_CHECKBOX_SET: number = 225;
	public static CHAR_RADIO_UNSET: number = 9;
	public static CHAR_RADIO_SET: number = 10;
	// sub-pixel resolution kit 
	public static CHAR_SUBP_NW: number = 226;
	public static CHAR_SUBP_NE: number = 227;
	public static CHAR_SUBP_N: number = 228;
	public static CHAR_SUBP_SE: number = 229;
	public static CHAR_SUBP_DIAG: number = 230;
	public static CHAR_SUBP_E: number = 231;
	public static CHAR_SUBP_SW: number = 232;
	// miscellaneous 
	public static CHAR_SMILIE : number =  1;
	public static CHAR_SMILIE_INV : number =  2;
	public static CHAR_HEART : number =  3;
	public static CHAR_DIAMOND : number =  4;
	public static CHAR_CLUB : number =  5;
	public static CHAR_SPADE : number =  6;
	public static CHAR_BULLET : number =  7;
	public static CHAR_BULLET_INV : number =  8;
	public static CHAR_MALE : number =  11;
	public static CHAR_FEMALE : number =  12;
	public static CHAR_NOTE : number =  13;
	public static CHAR_NOTE_DOUBLE : number =  14;
	public static CHAR_LIGHT : number =  15;
	public static CHAR_EXCLAM_DOUBLE : number =  19;
	public static CHAR_PILCROW : number =  20;
	public static CHAR_SECTION : number =  21;
	public static CHAR_POUND : number =  156;
	public static CHAR_MULTIPLICATION : number =  158;
	public static CHAR_FUNCTION : number =  159;
	public static CHAR_RESERVED : number =  169;
	public static CHAR_HALF : number =  171;
	public static CHAR_ONE_QUARTER : number =  172;
	public static CHAR_COPYRIGHT : number =  184;
	public static CHAR_CENT : number =  189;
	public static CHAR_YEN : number =  190;
	public static CHAR_CURRENCY : number =  207;
	public static CHAR_THREE_QUARTERS : number =  243;
	public static CHAR_DIVISION : number =  246;
	public static CHAR_GRADE : number =  248;
	public static CHAR_UMLAUT : number =  249;
	public static CHAR_POW1 : number =  251;
	public static CHAR_POW3 : number =  252;
	public static CHAR_POW2 : number =  253;
	public static CHAR_BULLET_SQUARE : number =  254;

  private _glyph: number;
  get glyph() {
    return this._glyph;
  }
  private _foregroundColor: Core.Color;
  get foregroundColor() {
    return this._foregroundColor;
  }
  private _backgroundColor: Core.Color;
  get backgroundColor() {
    return this._backgroundColor;
  }

  constructor(g: string | number = Glyph.CHAR_SPACE, f: Core.Color = 0xffffff, b: Core.Color = 0x000000) {
    this._glyph = typeof g === 'string' ? g.charCodeAt(0) : g;
    this._foregroundColor = f;
    this._backgroundColor = b;
  }
}

export = Glyph;
