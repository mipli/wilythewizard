import * as Core from '../core';
import * as Entities from '../entities';
import * as Components from '../components';
import * as Map from '../map';

import Engine = require('../Engine');

export function createFreezeRune(engine: Engine, position: Core.Position, factionComponent: Components.FactionComponent) {
    const rune = new Entities.Entity(engine, 'Rune', Entities.Type.Rune);
    if (factionComponent) {
      rune.addComponent(new Components.FactionComponent(engine, {
        faction: factionComponent.faction
      }));
    }
    rune.addComponent(new Components.PhysicsComponent(engine, {
      position: position,
      blocking: false
    }));
    rune.addComponent(new Components.RenderableComponent(engine, {
      glyph: new Map.Glyph('#', 0x47b9d8, 0x000000)
    }));
    rune.addComponent(new Components.SelfDestructComponent(engine, {
      turns: 10
    }));
    rune.addComponent(new Components.RuneFreezeComponent(engine));
    return rune;
}

export function createStunRune(engine: Engine, position: Core.Position, factionComponent: Components.FactionComponent) {
    const rune = new Entities.Entity(engine, 'Rune', Entities.Type.Rune);
    if (factionComponent) {
      rune.addComponent(new Components.FactionComponent(engine, {
        faction: factionComponent.faction
      }));
    }
    rune.addComponent(new Components.PhysicsComponent(engine, {
      position: position,
      blocking: false
    }));
    rune.addComponent(new Components.RenderableComponent(engine, {
      glyph: new Map.Glyph('#', 0xe57812, 0x000000)
    }));
    rune.addComponent(new Components.SelfDestructComponent(engine, {
      turns: 10
    }));
    rune.addComponent(new Components.RuneStunComponent(engine));
    return rune;
}
