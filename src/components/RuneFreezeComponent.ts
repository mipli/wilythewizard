import * as Core from '../core';
import * as Events from '../events';
import * as Components from './index';

import Engine = require('../Engine');

export class RuneFreezeComponent extends Components.Component {
  private radius: number;
  private charges: number;
  private physicsComponent: Components.PhysicsComponent;

  constructor(engine: Engine, data: {radius: number, charges: number} = {radius: 1, charges: 1}) {
    super(engine);
    this.radius = data.radius;
    this.charges = data.charges;
  }

  initialize() {
    this.physicsComponent = <Components.PhysicsComponent>this.entity.getComponent(Components.PhysicsComponent);
  }

  registerListeners() {
    this.listeners.push(this.engine.listen(new Events.Listener(
      'movedTo',
      this.onMovedTo.bind(this),
      50
    )));
  }

  private onMovedTo(event: Events.Event) {
    if (this.charges <= 0) {
      return;
    }
    const eventPosition = event.data.physicsComponent.position; 
    if (eventPosition.x == this.physicsComponent.position.x && 
        eventPosition.y === this.physicsComponent.position.y) {
      event.data.entity.addComponent(new Components.SlowComponent(this.engine, {factor: 0.5})); 
      this.charges--;
      if (this.charges <= 0) {
        this.engine.removeEntity(this.entity);
      }
    }
  }
}
