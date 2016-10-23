import * as Core from '../core';
import * as Behaviours from './index';
import * as Entities from '../entities';
import * as Events from '../events';
import * as Components from '../components';
import * as Map from '../map';

import * as Runes from '../runes';

import Engine = require('../Engine');

export class WriteRuneAction extends Behaviours.Action {
  private engine: Engine;
  private physics: Components.PhysicsComponent;
  private factionComponent: Components.FactionComponent;
  private runeCreator: (engine: Engine, position: Core.Position, Faction: Components.FactionComponent) => void;

  constructor(engine: Engine, entity: Entities.Entity, runeCreator: (engine: Engine, position: Core.Position, Faction: Components.FactionComponent) => void) {
    super();
    this.engine = engine;
    this.physics = <Components.PhysicsComponent>entity.getComponent(Components.PhysicsComponent);
    this.factionComponent = <Components.FactionComponent>entity.getComponent(Components.FactionComponent);
    this.runeCreator = runeCreator;
  }

  act(): number {
    this.runeCreator(this.engine, this.physics.position, this.factionComponent);
    return this.cost;
  }
}
