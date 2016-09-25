import * as Core from '../core';
import * as Events from '../events';
import * as Components from './index.ts';

import Engine = require('../Engine');

export class HealthComponent extends Components.Component {
  registerListeners() {
    this.entity.listen({
      type: 'damage',
      callback: this.onDamage.bind(this),
      priority: 1
    });
  }

  private onDamage(event: Events.Event) {
      this.engine.removeEntity(this.entity);
      this.engine.emit(new Events.Event('message', {
        message: this.entity.name + ' was killed by ' + event.data.source.name + '.',
        target: this.entity
      }));
  };
}
