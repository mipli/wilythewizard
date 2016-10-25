export namespace Random {
  let randomizer: any;

  function init() {
    if (!randomizer) {
      const seed = (<any>window).SEED ? (<any>window).SEED : Date.now();
      console.log('Random seed', seed);
      randomizer = new (<any>Math).seedrandom(seed);
    }
  }

  export function get(min: number = 0, max: number = 1): number {
    init();
    const rand = randomizer.quick();
    return Math.floor(min + rand * (max-min));
  }

  export function getFloat() {
    return randomizer.quick();
  }

  export function getRandomIndex<T>(array: T[]): T {
    return array[get(0, array.length)];
  }

  export function randomizeArray<T>(array: T[]): T[] {
    if (array.length <= 1) return array;

    for (let i = 0; i < array.length; i++) {
      const randomChoiceIndex = get(i, array.length);

      [array[i], array[randomChoiceIndex]] = [array[randomChoiceIndex], array[i]];
    }

    return array;
  }
}
