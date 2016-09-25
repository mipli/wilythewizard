import * as Core from '../core';
import * as Events from '../events';
import * as Components from './index.ts';

import Engine = require('../Engine');

export class SelfDestructComponent extends Components.Component {
  private maxTurns: number;
  private turnsLeft: number;

  constructor(engine: Engine, data: {turns: number}) {
    super(engine);
    this.maxTurns = data.turns;
    this.turnsLeft = data.turns;
    this.listeners = [];
  }

  registerListeners() {
    this.listeners.push(this.engine.listen(new Events.Listener(
      'turn',
      this.onTurn.bind(this),
      50
    )));
  }

  private onTurn(event: Events.Event) {
    this.turnsLeft--;
    if (this.turnsLeft < 0) {
      this.engine.removeEntity(this.entity);
    }
  }
}
