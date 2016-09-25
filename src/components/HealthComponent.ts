import * as Core from '../core';
import * as Events from '../events';
import * as Components from './index';

import Engine = require('../Engine');

export class HealthComponent extends Components.Component {
  registerListeners() {
    this.entity.listen(new Events.Listener(
       'damage',
      this.onDamage.bind(this)
    ));
  }

  private onDamage(event: Events.Event) {
      this.engine.removeEntity(this.entity);
      this.engine.emit(new Events.Event('message', {
        message: this.entity.name + ' was killed by ' + event.data.source.name + '.',
        target: this.entity
      }));
  };
}
