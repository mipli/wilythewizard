import Engine = require('../Engine');

import * as Behaviours from '../behaviours';
import * as Components from './index.ts';
import * as Events from '../events';

export class RoamingAIComponent extends Components.Component {
  private energyComponent: Components.EnergyComponent;

  private randomWalkBehaviour: Behaviours.RandomWalkBehaviour;

  protected initialize() {
    this.energyComponent = <Components.EnergyComponent>this.entity.getComponent(Components.EnergyComponent);
    this.randomWalkBehaviour = new Behaviours.RandomWalkBehaviour(this.engine, this.entity);
  }

  protected registerListeners() {
    this.listeners.push(this.engine.listen(new Events.Listener(
      'tick',
      this.onTick.bind(this)
    )));
  }

  onTick(event: Events.Event) {
    if (this.energyComponent.currentEnergy >= 100) {
      let action = this.randomWalkBehaviour.getNextAction();
      this.energyComponent.useEnergy(action.act());
    }
  }
}
