import Engine = require('../Engine');
import * as Components from './index';
import * as Events from '../events';

export class EnergyComponent extends Components.Component {
  private _currentEnergy: number;
  get currentEnergy() {
    return this._currentEnergy;
  }

  private _energyRegenerationRate: number;
  get energyRegenerationRate() {
    return this._energyRegenerationRate;
  }

  private _maxEnergy: number;
  get maxEnergy() {
    return this._maxEnergy;
  }

  constructor(engine: Engine, data: {regenratationRate: number, max: number} = {regenratationRate: 100, max: 100}) {
    super(engine);
    this._currentEnergy = this._maxEnergy = data.max;
    this._energyRegenerationRate = data.regenratationRate;
  }

  protected registerListeners() {
    this.listeners.push(this.engine.listen(new Events.Listener(
      'tick',
      this.onTick.bind(this),
      1
    )));
  }

  private onTick(event: Events.Event) {
    let rate = this._energyRegenerationRate;
    let rateModifiers = this.entity.gather(new Events.Event('onEnergyRegeneration'));
    rateModifiers.forEach((modifier) => {
      rate = rate * modifier;
    });
    this._currentEnergy = Math.min(this.maxEnergy, this._currentEnergy + rate);
  }

  useEnergy(energy: number): number {
    this._currentEnergy = this._currentEnergy - energy;
    return this._currentEnergy;
  }
}
