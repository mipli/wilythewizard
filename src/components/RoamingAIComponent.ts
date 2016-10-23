import Engine = require('../Engine');

import * as Behaviours from '../behaviours';
import * as Components from './index';
import * as Events from '../events';

export class RoamingAIComponent extends Components.Component {
  private energyComponent: Components.EnergyComponent;

  private behaviourTree: Behaviours.BehaviourTree;

  protected initialize() {
    this.energyComponent = <Components.EnergyComponent>this.entity.getComponent(Components.EnergyComponent);
    this.initializeBehaviourTree();
  }

  private initializeBehaviourTree() {
    this.behaviourTree = new Behaviours.BehaviourTree();
    this.behaviourTree.addRoot(
      new Behaviours.RandomWalkBehaviour(this.engine, this.entity)
    );
  }

  protected registerListeners() {
    this.listeners.push(this.engine.listen(new Events.Listener(
      'tick',
      this.onTick.bind(this)
    )));
  }

  onTick(event: Events.Event) {
    if (this.energyComponent.currentEnergy >= 100) {
      let action = this.behaviourTree.invoke();
      if (typeof (<Behaviours.Action>action).act === 'function') {
        this.energyComponent.useEnergy((<Behaviours.Action>action).act());
      } else {
        console.error('Invalid action', action);
        this.energyComponent.useEnergy(100);
      }
    }
  }
}
