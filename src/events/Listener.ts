import * as Core from '../core';
import * as Events from './index';

export class Listener {
  public type: string;
  public priority: number;
  public callback: (event: Events.Event) => any;
  public guid: string;

  constructor(type: string, callback: (event: Events.Event) => any, priority: number = 100, guid: string = null) {
    this.type = type;
    this.priority = priority;
    this.callback = callback;
    this.guid = guid || Core.Utils.generateGuid();
  }
}
