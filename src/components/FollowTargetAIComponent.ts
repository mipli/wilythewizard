import Engine = require('../Engine');

import * as Behaviours from '../behaviours';
import * as Components from './index';
import * as Events from '../events';
import * as Entities from '../entities';

export class FollowTargetAIComponent extends Components.Component {
  private energyComponent: Components.EnergyComponent;
  private findTargetBehavoiur: Behaviours.FindTargetBehaviour;

  private targetType: Entities.Type;
  private target: Entities.Entity;

  constructor(engine: Engine, data: {targetType: Entities.Type}) {
    super(engine);
    this.targetType = data.targetType;
  }

  protected initialize() {
    this.energyComponent = <Components.EnergyComponent>this.entity.getComponent(Components.EnergyComponent);
    this.findTargetBehavoiur = new Behaviours.FindTargetBehaviour(this.engine, this.entity);
  }

  protected registerListeners() {
    this.listeners.push(this.engine.listen(new Events.Listener(
      'tick',
      this.onTick.bind(this)
    )));
  }

  onTick(event: Events.Event) {
    if (this.energyComponent.currentEnergy >= 100) {
         let action = this.findTargetBehavoiur.getNextAction();
         this.energyComponent.useEnergy(action.act());
    }
  }
}
