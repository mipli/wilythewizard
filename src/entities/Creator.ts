import * as Core from '../core';
import * as Events from '../events';
import * as Components from '../components';
import * as Map from '../map';
import * as Entities from './index';

import Engine = require('../Engine');

export enum Type {
  Other = 1,
  Player,
  Rune,
  Vermin,
  Demon
}

export function createImp(engine: Engine) {
    let imp = new Entities.Entity(engine, 'Imp', Type.Demon);
    imp.addComponent(new Components.PhysicsComponent(engine));
    imp.addComponent(new Components.RenderableComponent(engine, {
      glyph: new Map.Glyph('i', 0xaa33aa, 0x000000)
    }));
    imp.addComponent(new Components.EnergyComponent(engine));
    imp.addComponent(new Components.FollowTargetAIComponent(engine, {
      targetType: Entities.Type.Player
    }));
    imp.addComponent(new Components.HealthComponent(engine));

    return imp;
}

export function createWily(engine: Engine) {
    let wily = new Entities.Entity(engine, 'Wily', Type.Player);
    wily.addComponent(new Components.FactionComponent(engine, {
      faction: 'PLAYER'
    }));
    wily.addComponent(new Components.PhysicsComponent(engine));
    wily.addComponent(new Components.RenderableComponent(engine, {
      glyph: new Map.Glyph('@', 0xffffff, 0x000000)
    }));
    wily.addComponent(new Components.EnergyComponent(engine));
    wily.addComponent(new Components.InputComponent(engine));
    wily.addComponent(new Components.RuneWriterComponent(engine));
    wily.addComponent(new Components.HealthComponent(engine));

    return wily;
}

export function createRat(engine: Engine) {
    let rat = new Entities.Entity(engine, 'Rat', Type.Vermin);
    rat.addComponent(new Components.PhysicsComponent(engine));
    rat.addComponent(new Components.RenderableComponent(engine, {
      glyph: new Map.Glyph('r', 0xffffff, 0x000000)
    }));
    rat.addComponent(new Components.EnergyComponent(engine));
    rat.addComponent(new Components.RoamingAIComponent(engine));
    rat.addComponent(new Components.HealthComponent(engine));

    return rat;
}
