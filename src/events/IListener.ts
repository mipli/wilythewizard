import * as Events from './index';

export interface IListener {
  type: string;
  priority: number;
  callback: (event: Events.Event) => any;
}
