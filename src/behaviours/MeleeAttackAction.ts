import * as Core from '../core';
import * as Events from '../events';
import * as Behaviours from './index';
import * as Components from '../components';
import * as Entities from '../entities';

import Engine = require('../Engine');

export class MeleeAttackAction extends Behaviours.Action {
  constructor(protected entity: Entities.Entity, protected target: Entities.Entity) {
    super();
  }

  act() {
    this.target.emit(new Events.Event('damage', {
      target: this.target,
      source: this.entity
    }));
    return this.cost;
  }
}
