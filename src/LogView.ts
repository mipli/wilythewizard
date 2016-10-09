import * as Events from './events';
import * as Entities from './entities';

import Engine = require('./Engine');
import Glyph = require('./Glyph');
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
    }
    if (this.player) {
      this.effects = this.player.gather(new Events.Event('getStatusEffect'));
    }
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
    this.console.setText(' ', 0, 0, this.console.width, this.console.height);

    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        let drawn = false;
        if (i === 0 && j === 0) {
          this.console.setText(Glyph.CHAR_SE, i, j);
          drawn = true;
        } else if (i === this.width - 1 && j === 0) {
          this.console.setText(Glyph.CHAR_SW, i, j);
          drawn = true;
        } else if (i === this.width - 1 && j === this.height - 1) {
          this.console.setText(Glyph.CHAR_NW, i, j);
          drawn = true;
        } else if (i === 0 && j === this.height - 1) {
          this.console.setText(Glyph.CHAR_NE, i, j);
          drawn = true;
        } else if (i === 0 || i === this.width - 1) {
          this.console.setText(Glyph.CHAR_VLINE, i, j);
          drawn = true;
        } else if (j === 0 || j === (this.height - 1)) {
          this.console.setText(Glyph.CHAR_HLINE, i, j);
          drawn = true;
        }
        if (drawn) {
          this.console.setForeground(0xffffff, i, j);
          this.console.setBackground(0x000000, i, j);
        }
      }
    }

    this.console.print('Turn: ' + this.currentTurn, this.width - 10, 1, 0xffffff);
    if (this.effects.length > 0) {
      let str = this.effects.reduce((acc, effect, idx) => {
        return acc + effect.name + (idx !== this.effects.length - 1 ? ', ' : '');
      }, 'Effects: ');
      this.console.print(str, 1, 1, 0xffffff);
    }
    if (this.messages.length > 0) {
      this.messages.forEach((data, idx) => {
        let color = 0xffffff;
        if (data.turn < this.currentTurn - 5) {
          color = 0x666666;
        } else if (data.turn < this.currentTurn - 2) {
          color = 0xaaaaaa;
        }
        this.console.print(data.message, 1, this.height - (idx + 1), color);
      });
    }
    blitFunction(this.console);
  }
}

export = LogView;
