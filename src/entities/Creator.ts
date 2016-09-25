import * as Core from '../core';
import * as Events from '../events';
import * as Components from '../components';
import * as Entities from './index';

import Engine = require('../Engine');
import Glyph = require('../Glyph');

export function createWily(engine: Engine) {
    let wily = new Entities.Entity(engine, 'wily');
    wily.addComponent(new Components.PhysicsComponent(engine));
    wily.addComponent(new Components.RenderableComponent(engine, {
      glyph: new Glyph('@', 0xffffff, 0x000000)
    }));
    wily.addComponent(new Components.EnergyComponent(engine));
    wily.addComponent(new Components.InputComponent(engine));
    wily.addComponent(new Components.RuneWriterComponent(engine));

    return wily;
}

export function createRat(engine: Engine) {
    let rat = new Entities.Entity(engine, 'rat');
    rat.addComponent(new Components.PhysicsComponent(engine));
    rat.addComponent(new Components.RenderableComponent(engine, {
      glyph: new Glyph('r', 0xffffff, 0x000000)
    }));
    rat.addComponent(new Components.EnergyComponent(engine));
    rat.addComponent(new Components.RoamingAIComponent(engine));

    return rat;
}
