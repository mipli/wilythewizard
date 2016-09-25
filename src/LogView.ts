import * as Events from './events';
import * as Entities from './entities';

import Engine = require('./Engine');
import Console = require('./Console');

class LogView {
  private currentTurn: number;
  private messages: {turn: number, message: string}[];
  private console: Console;
  private player: Entities.Entity;
  private maxMessages: number;
  private effects: any[];

  constructor(private engine: Engine, private width: number, private height: number, player: Entities.Entity) {
    this.registerListeners();

    this.console = new Console(this.width, this.height);
    this.currentTurn = 1;
    this.messages = [];
    this.maxMessages = this.height - 1;

    this.player = player;
    this.effects = [];
  }

  private registerListeners() {
    this.engine.listen(new Events.Listener(
      'turn',
      this.onTurn.bind(this)
    ));

    this.engine.listen(new Events.Listener(
      'message',
      this.onMessage.bind(this)
    ));
  }

  private onTurn(event: Events.Event) {
    this.currentTurn = event.data.currentTurn;
    if (this.messages.length > 0 && this.messages[this.messages.length - 1].turn < this.currentTurn - 10) {
      this.messages.pop();
      this.console.setText(' ', 0, 0, this.console.width, this.console.height);
    }

    this.effects = this.player.gather(new Events.Event('getStatusEffect'));
  }

  private onMessage(event: Events.Event) {
    if (event.data.message) {
      this.messages.unshift({
        turn: this.currentTurn,
        message: event.data.message
      });
    }
    if (this.messages.length > this.maxMessages) {
      this.messages.pop();
    }
  }

  render(blitFunction: any) {
    this.console.setText(' ', this.width - 10, 0, 10);
    this.console.print('Turn: ' + this.currentTurn, this.width - 10, 0, 0xffffff);
    if (this.effects.length > 0) {
      let str = this.effects.reduce((acc, effect, idx) => {
        return acc + effect.name + (idx !== this.effects.length - 1 ? ', ' : '');
      }, 'Effects: ');
      this.console.print(str, 0, 0, 0xffffff);
    }
    this.console.print
    if (this.messages.length > 0) {
      this.messages.forEach((data, idx) => {
        let color = 0xffffff;
        if (data.turn < this.currentTurn - 5) {
          color = 0x666666;
        } else if (data.turn < this.currentTurn - 2) {
          color = 0xaaaaaa;
        }
        this.console.print(data.message, 0, this.height - idx, color);
      });
    }
    blitFunction(this.console);
  }
}

export = LogView;
