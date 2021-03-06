import * as Core from '../core';
import * as Behaviours from '../behaviours';
import * as Events from '../events';
import * as Entities from '../entities';
import * as Components from './index';

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
    this.entity.listen(new Events.Listener(
      'writeRune',
      this.onWriteRune.bind(this)
    ));
  }

  onWriteRune(event: Events.Event) {
    const tile = this.engine.fire(new Events.Event('getTile', {
      position: this.physicalComponent.position
    }));

    let hasRune = false;
    for (var key in tile.props) {
      if (tile.props[key].type === 'rune') {
        hasRune = true;
      }
    }

    if (hasRune) {
      return null;
    }
  
    return new Behaviours.WriteRuneAction(this.engine, this.entity, event.data.runeCreator);
  }
}
