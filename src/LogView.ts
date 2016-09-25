import * as Events from './events';

import Engine = require('./Engine');
import Console = require('./Console');

class LogView {
  private currentTurn: number;
  private messages: string[];
  private console: Console;

  constructor(private engine: Engine, private width: number, private height: number) {
    this.registerListeners();

    this.console = new Console(this.width, this.height);
    this.currentTurn = 1;
    this.messages = [];
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
  }

  private onMessage(event: Events.Event) {
    if (event.data.message) {
      this.messages.unshift(event.data.message);
    }
    if (this.messages.length > this.height) {
      this.messages.pop();
    }
  }

  render(blitFunction: any) {
    this.console.print('Turn: ' + this.currentTurn, this.width - 10, 0, 0xffffff);
    this.messages.forEach((msg, idx) => {
      this.console.print(msg, 0, idx, 0xffffff);
    });
    blitFunction(this.console);
  }
}

export = LogView;
