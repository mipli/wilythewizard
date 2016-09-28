import Engine = require('../Engine');
import * as Components from './index';
import * as Events from '../events';

export class TimeHandlerComponent extends Components.Component {
  private _currentTick: number;
  get currentTick() {
    return this._currentTick;
  }

  private _currentTurn: number;
  get currentTurn() {
    return this._currentTurn;
  }

  private ticksPerTurn: number;
  private turnTime: number;

  private paused: boolean;

  protected initialize() {
    this.ticksPerTurn = 1;
    this.turnTime = 0;
    this._currentTurn = 0;
    this._currentTick = 0;
    this.paused = false;
  }

  protected registerListeners() {
    this.engine.listen(new Events.Listener(
      'pauseTime',
      this.onPauseTime.bind(this)
    ));
    this.engine.listen(new Events.Listener(
      'resumeTime',
      this.onResumeTime.bind(this)
    ));
  }

  private onPauseTime(event: Events.Event) {
    this.paused = true;
  }

  private onResumeTime(event: Events.Event) {
    this.paused = false;
  }

  engineTick(gameTime: number) {
    if (this.paused) {
      return;
    }
    this._currentTick++;
    this.engine.currentTick = this._currentTick;
    if ((this._currentTick % this.ticksPerTurn) === 0) {
      this._currentTurn++;
      this.engine.currentTurn = this._currentTurn;
      this.engine.emit(new Events.Event('turn', {currentTurn: this._currentTurn, currentTick: this._currentTick}));

      this.turnTime = gameTime;

    }
    this.engine.emit(new Events.Event('tick', {currentTurn: this._currentTurn, currentTick: this._currentTick}));
  }

}
