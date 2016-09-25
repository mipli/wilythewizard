import * as Core from '../core';
import * as Events from '../events';
import * as Components from './index';
import * as Behaviours from '../behaviours';

import InputHandler = require('../InputHandler');
import Glyph = require('../Glyph');
import Engine = require('../Engine');

export class InputComponent extends Components.Component {
  private energyComponent: Components.EnergyComponent;
  private physicsComponent: Components.PhysicsComponent;
  private hasFocus: boolean;

  protected initialize() {
    this.energyComponent = <Components.EnergyComponent>this.entity.getComponent(Components.EnergyComponent);
    this.physicsComponent = <Components.PhysicsComponent>this.entity.getComponent(Components.PhysicsComponent);
    this.hasFocus = false;
  }

  protected registerListeners() {
    this.listeners.push(this.engine.listen(new Events.Listener(
      'tick',
      this.onTick.bind(this)
    )));

    this.engine.inputHandler.listen(
      [InputHandler.KEY_UP, InputHandler.KEY_K], 
      this.onMoveUp.bind(this)
    );
    this.engine.inputHandler.listen(
      [InputHandler.KEY_U],
      this.onMoveUpRight.bind(this)
    );
    this.engine.inputHandler.listen(
      [InputHandler.KEY_RIGHT, InputHandler.KEY_L], 
      this.onMoveRight.bind(this)
    );
    this.engine.inputHandler.listen(
      [InputHandler.KEY_N],
      this.onMoveDownRight.bind(this)
    );
    this.engine.inputHandler.listen(
      [InputHandler.KEY_DOWN, InputHandler.KEY_J], 
      this.onMoveDown.bind(this)
    );
    this.engine.inputHandler.listen(
      [InputHandler.KEY_B],
      this.onMoveDownLeft.bind(this)
    );
    this.engine.inputHandler.listen(
      [InputHandler.KEY_LEFT, InputHandler.KEY_H], 
      this.onMoveLeft.bind(this)
    );
    this.engine.inputHandler.listen(
      [InputHandler.KEY_Y],
      this.onMoveUpLeft.bind(this)
    );
    this.engine.inputHandler.listen(
      [InputHandler.KEY_PERIOD], 
      this.onWait.bind(this)
    );
    this.engine.inputHandler.listen(
      [InputHandler.KEY_0], 
      this.onTrapOne.bind(this)
    );
  }

  onTick(event: Events.Event) {
    if (this.energyComponent.currentEnergy >= 100) {
      this.act();
    }
  }

  act() {
    this.hasFocus = true;
    this.engine.emit(new Events.Event('pauseTime'));
  }

  private performAction(action: Behaviours.Action) {
    this.hasFocus = false;
    this.engine.emit(new Events.Event('resumeTime'));
    this.energyComponent.useEnergy(action.act());
  }

  private onWait() {
    if (!this.hasFocus) {
      return;
    }
    this.performAction(new Behaviours.NullAction());
  }

  private onTrapOne() {
    if (!this.hasFocus) {
      return;
    }
    const action = this.entity.fire(new Events.Event('writeRune', {}));
    if (action) {
      this.performAction(action);
    }
  }

  private onMoveUp() {
    if (!this.hasFocus) {
      return;
    }
    this.handleMovement(new Core.Position(0, -1));
  }

  private onMoveUpRight() {
    if (!this.hasFocus) {
      return;
    }
    this.handleMovement(new Core.Position(1, -1));
  }

  private onMoveRight() {
    if (!this.hasFocus) {
      return;
    }
    this.handleMovement(new Core.Position(1, 0));
  }

  private onMoveDownRight() {
    if (!this.hasFocus) {
      return;
    }
    this.handleMovement(new Core.Position(1, 1));
  }

  private onMoveDown() {
    if (!this.hasFocus) {
      return;
    }
    this.handleMovement(new Core.Position(0, 1));
  }

  private onMoveDownLeft() {
    if (!this.hasFocus) {
      return;
    }
    this.handleMovement(new Core.Position(-1, 1));
  }

  private onMoveLeft() {
    if (!this.hasFocus) {
      return;
    }
    this.handleMovement(new Core.Position(-1, 0));
  }

  private onMoveUpLeft() {
    if (!this.hasFocus) {
      return;
    }
    this.handleMovement(new Core.Position(-1, -1));
  }

  private handleMovement(direction: Core.Position) {
    const position = Core.Position.add(this.physicsComponent.position, direction);
    const isWithoutEntity = this.engine.is(new Events.Event('isWithoutEntity', {position: position}));
    if (isWithoutEntity) {
      this.performAction(new Behaviours.WalkAction(this.physicsComponent, position));
    }
  }
}
