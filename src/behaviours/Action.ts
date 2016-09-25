import * as Exceptions from '../Exceptions';

export class Action {
  protected cost: number = 100;
  act(): number {
    throw new Exceptions.MissingImplementationError('Action.act must be overwritten');
  }
}
