import * as Events from '../events';

export interface IEventHandler {
  listen: (listener: Events.Listener) => Events.Listener;
  removeListener: (listener: Events.Listener) => void;
  emit: (event: Events.Event) => void;
  fire: (event: Events.Event) => any;
  is: (event: Events.Event) => boolean;
  gather: (event: Events.Event) => any[];
}

export class EventHandler implements IEventHandler {
  private listeners: {[event: string]: Events.Listener[]} = {};

  listen(listener: Events.Listener) {
    if (!this.listeners) {
      this.listeners = {};
    }
    if (!this.listeners[listener.type]) {
      this.listeners[listener.type] = [];
    }

    this.listeners[listener.type].push(listener);
    this.listeners[listener.type] = this.listeners[listener.type].sort((a: Events.Listener, b: Events.Listener) => a.priority - b.priority);

    return listener;
  }

  removeListener(listener: Events.Listener) {
    if (!this.listeners || !this.listeners[listener.type]) {
      return null;
    }

    const idx = this.listeners[listener.type].findIndex((l) => {
      return l.guid === listener.guid;
    });
    if (typeof idx === 'number') {
      this.listeners[listener.type].splice(idx, 1);
    }
  }

  emit(event: Events.Event) {
    if (!this.listeners[event.type]) {
      return null;
    }
    const listeners = this.listeners[event.type].map((i) => i);

    listeners.forEach((listener) => {
      listener.callback(event);
    });
  }

  is(event: Events.Event): boolean {
    if (!this.listeners[event.type]) {
      return true;
    }

    let returnedValue = true;

    this.listeners[event.type].forEach((listener) => {
      if (!returnedValue) {
        return;
      }
      returnedValue = listener.callback(event);
    });
    return returnedValue;
  }

  fire(event: Events.Event) {
    if (!this.listeners[event.type]) {
      return null;
    }

    let returnedValue = null;

    this.listeners[event.type].forEach((listener) => {
      returnedValue = listener.callback(event);
    });
    return returnedValue;
  }

  gather(event: Events.Event): any[] {
    if (!this.listeners[event.type]) {
      return [];
    }

    let values = []

    this.listeners[event.type].forEach((listener) => {
      values.push(listener.callback(event));
    });
    return values;
  }
}
