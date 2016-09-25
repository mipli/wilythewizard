import * as Core from '../core';
import * as Behaviours from '../behaviours';
import * as Events from '../events';
import * as Entities from '../entities';
import * as Components from './index.ts';

import Glyph = require('../Glyph');
import Engine = require('../Engine');

export class RuneWriterComponent extends Components.Component {
  private physicalComponent: Components.PhysicsComponent;

  constructor(engine: Engine, data: {} = {}) {
    super(engine);
  }

  protected initialize() {
    this.physicalComponent = <Components.PhysicsComponent>this.entity.getComponent(Components.PhysicsComponent);
  }

  protected registerListeners() {
    this.entity.listen({
      type: 'writeRune',
      callback: this.onWriteRune.bind(this),
      priority: 1
    });
  }

  onWriteRune(event: Events.Event) {
    const tile = this.engine.fire(new Events.Event('getTile', {
      position: this.physicalComponent.position
    }));

    let hasRune = false;
    for (var key in tile.props) {
      if (tile.props[key].name === 'rune') {
        hasRune = true;
      }
    }

    if (hasRune) {
      return null;
    }
  
    return new Behaviours.WriteRuneAction(this.engine, this.entity);

  }
}
