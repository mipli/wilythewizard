import * as Core from '../core';
import * as Events from '../events';
import * as Components from './index';

import Engine = require('../Engine');

export class StunComponent extends Components.Component {
  private _factor: number;
  get factor() {
    return this._factor;
  }

  constructor(engine: Engine) {
    super(engine);
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
    return 0;
  }

  private onGetStatusEffect(event: Events.Event) {
    return {
      name: 'Stun',
      symbol: 'St'
    };
  }

}
