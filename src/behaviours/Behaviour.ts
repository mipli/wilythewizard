import * as Exceptions from '../Exceptions';
import * as Behaviours from './index';
import * as Entities from '../entities';

export type InvokedValue = Behaviours.Action | Object;

export class Behaviour {
  protected nextAction: Behaviours.Action;
  constructor(protected entity: Entities.Entity) {
  }
  invoke(): InvokedValue {
    throw new Exceptions.MissingImplementationError('Behaviour.invoke must be overwritten');
  }
}
