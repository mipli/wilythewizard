export * from './Color';
export * from './Position';

export namespace Utils {
  // CRC32 utility. Adapted from http://stackoverflow.com/questions/18638900/javascript-crc32
  let crcTable: number[];
  function makeCRCTable() {
    let c: number;
    crcTable = [];
    for (let n: number = 0; n < 256; n++) {
      c = n;
      for (let k: number = 0; k < 8; k++) {
        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      }
      crcTable[n] = c;
    }
  }

  export function buildMatrix<T>(w: number, h: number, value: T): T[][] {
    let ret: T[][] = [];
    for ( let x: number = 0; x < w; ++x) {
      ret[x] = [];
      for ( let y: number = 0; y < h; ++y) {
        ret[x][y] = value;
      }
    }
    return ret;
  }

  export function crc32(str: string): number {
    if (!crcTable) {
      makeCRCTable();
    }
    let crc: number = 0 ^ (-1);
    for (let i: number = 0, len: number = str.length; i < len; ++i) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  };

  export function toCamelCase(input: string): string {
    return input.toLowerCase().replace(/(\b|_)\w/g, function(m) {
      return m.toUpperCase().replace(/_/, "");
    });
  }

  export function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }
  export function getRandom(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  export function getRandomIndex<T>(array: T[]): T {
    return array[getRandom(0, array.length - 1)];
  }

  export function randomizeArray<T>(array: T[]): T[] {
    if (array.length <= 1) return array;

    for (let i = 0; i < array.length; i++) {
      const randomChoiceIndex = getRandom(i, array.length - 1);

      [array[i], array[randomChoiceIndex]] = [array[randomChoiceIndex], array[i]];
    }

    return array;
  }
}
