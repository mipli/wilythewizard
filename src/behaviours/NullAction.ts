import * as Behaviours from './index';

export class NullAction extends Behaviours.Action {
  act(): number {
    return this.cost;
  }
}
