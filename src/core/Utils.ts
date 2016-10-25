import * as Core from './index';

export namespace Utils {
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

  export function toCamelCase(input: string): string {
    return input.toLowerCase().replace(/(\b|_)\w/g, function(m) {
      return m.toUpperCase().replace(/_/, "");
    });
  }

  export function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Core.Random.getFloat()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }

  export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        derivedCtor.prototype[name] = baseCtor.prototype[name];
      });
    });
  }
}
