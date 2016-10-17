import * as Core from '../core';
import * as Events from '../events';
import * as Components from './index';

import Engine = require('../Engine');

export class FactionComponent extends Components.Component {
  private _faction: string;
  get faction() {
    return this._faction;
  }

  constructor(engine: Engine, data: {faction: string}) {
    super(engine);
    this._faction = data.faction;
  }
}
