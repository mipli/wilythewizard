import * as Core from '../core';
import * as Events from '../events';
import * as Components from './index';

import Engine = require('../Engine');

export class SlowComponent extends Components.Component {
  private _factor: number;
  get factor() {
    return this._factor;
  }

  constructor(engine: Engine, data: {factor: number}) {
    super(engine);
    this._factor = data.factor;
  }

  registerListeners() {
    this.listeners.push(this.entity.listen(new Events.Listener(
      'onEnergyRegeneration',
      this.onEnergyRegeneration.bind(this),
      50
    )));

    this.listeners.push(this.entity.listen(new Events.Listener(
      'getStatusEffect',
      this.onGetStatusEffect.bind(this)
    )));
  }

  private onEnergyRegeneration(event: Events.Event) {
    return this._factor;
  }

  private onGetStatusEffect(event: Events.Event) {
    return {
      name: 'Slow',
      symbol: 'S'
    };
  }

}
