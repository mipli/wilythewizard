import * as Exceptions from '../Exceptions';
import * as Behaviours from './index';
import * as Entities from '../entities';

export class Behaviour {
  protected nextAction: Behaviours.Action;
  constructor(protected entity: Entities.Entity) {
  }
  getNextAction(): Behaviours.Action {
    throw new Exceptions.MissingImplementationError('Behaviour.getNextAction must be overwritten');
  }
}
