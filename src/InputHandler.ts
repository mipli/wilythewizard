import Engine = require('./Engine');

class InputHandler {
  public static KEY_PERIOD: number = 190;
  public static KEY_LEFT: number = 37;
  public static KEY_UP: number = 38;
  public static KEY_RIGHT: number = 39;
  public static KEY_DOWN: number = 40;

  public static KEY_0: number = 48;
  public static KEY_1: number = 49;
  public static KEY_2: number = 50;
  public static KEY_3: number = 51;
  public static KEY_4: number = 52;
  public static KEY_5: number = 53;
  public static KEY_6: number = 54;
  public static KEY_7: number = 55;
  public static KEY_8: number = 56;
  public static KEY_9: number = 57;

  public static KEY_A: number = 65;
  public static KEY_B: number = 66;
  public static KEY_C: number = 67;
  public static KEY_D: number = 68;
  public static KEY_E: number = 69;
  public static KEY_F: number =	70;
  public static KEY_G: number =	71;
  public static KEY_H: number =	72;
  public static KEY_I: number =	73;
  public static KEY_J: number =	74;
  public static KEY_K: number =	75;
  public static KEY_L: number =	76;
  public static KEY_M: number =	77;
  public static KEY_N: number =	78;
  public static KEY_O: number =	79;
  public static KEY_P: number =	80;
  public static KEY_Q: number =	81;
  public static KEY_R: number =	82;
  public static KEY_S: number =	83;
  public static KEY_T: number =	84;
  public static KEY_U: number =	85;
  public static KEY_V: number =	86;
  public static KEY_W: number =	87;
  public static KEY_X: number =	88;
  public static KEY_Y: number =	89;
  public static KEY_Z: number =	90;

  private listeners: {[keycode: number]: (() => any)[]};

  constructor(private engine: Engine) {
    this.listeners = {};

    this.registerListeners();
  }

  private registerListeners() {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  private onKeyDown(event: KeyboardEvent) {
    if (this.listeners[event.keyCode]) {
      this.listeners[event.keyCode].forEach((callback) => {
        callback();
      });
    }
  }

  public listen(keycodes: number[], callback: () => any) {
    keycodes.forEach((keycode) => {
      if (!this.listeners[keycode]) {
        this.listeners[keycode] = [];
      }
      this.listeners[keycode].push(callback);
    });
  }
}

export = InputHandler;
