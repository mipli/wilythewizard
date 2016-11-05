import * as Exceptions from '../Exceptions';
import * as Behaviours from '../behaviours';

export class BehaviourTree {
  private _root: BehaviourNode;
  private currentNode: BehaviourNode;

  constructor() {
    this.currentNode = null;
  }

  invoke(data: {} = {}): Behaviours.InvokedValue {
    if (this.currentNode) {
      return this.currentNode.invoke(null);
    }
    return this._root.invoke(data);
  }

  addRoot(root: BehaviourNode) {
    this._root = root;
  }

  setCurrentNode(node: BehaviourNode) {
    this.currentNode = node;
  }
}

export type BehaviourNode = ControlFlowNode | Behaviours.Behaviour;

export interface ControlFlowNode {
  parent: BehaviourNode;
  children: BehaviourNode[];
  currentNode: BehaviourNode;

  addChild(BehaviourNode): void;
  invoke({}): Behaviours.InvokedValue;
}

export class SequenceNode implements ControlFlowNode {
  private _parent: BehaviourNode;
  get parent() {
    return this._parent;
  }
  set parent(value: BehaviourNode) {
    this._parent = value;

  }

  private _currentNode: BehaviourNode;
  get currentNode() {
    return this._currentNode;
  }

  private _children: BehaviourNode[];
  get children() {
    return this._children;
  }

  private currentNodeIndex: number;

  constructor() {
    this._parent = null;
    this.currentNodeIndex = 0;
    this._children = [];
  }

  invoke(data: {} = {}): Behaviours.InvokedValue {
    if (this.currentNode) {
      return this.step();
    }
    this.currentNodeIndex = 0;
    return this.step(data);
  }

  addChild(node: BehaviourNode) {
    this._children.push(node);
    if ((<Behaviours.ControlFlowNode>node).parent) {
      (<Behaviours.ControlFlowNode>node).parent = node;
    }
  }

  private step(data: {} = {}) {
    if (this.currentNodeIndex >= this._children.length) {
      return false;
    }

    let node = this._children[this.currentNodeIndex];
    let nodeValue = node.invoke(data);

    if (nodeValue) {
      if (typeof (<Behaviours.Action>nodeValue).act === 'function') {
        this._currentNode = node;
        return nodeValue;
      } else {
        this._currentNode = null;
        this.currentNodeIndex++;
        return this.step(nodeValue);
      }
    }
    this._currentNode = null;
    return false;
  }
}

export class SelectorNode implements ControlFlowNode {
  private _parent: BehaviourNode;
  get parent() {
    return this._parent;
  }

  private _currentNode: BehaviourNode;
  get currentNode() {
    return this._currentNode;
  }

  private _children: BehaviourNode[];
  get children() {
    return this._children;
  }

  constructor() {
    this._parent = null;
    this._children = [];
  }

  invoke(data: {} = {}): Behaviours.InvokedValue {
    let ret = null;
    this._children.some((node: BehaviourNode) => {
      ret = node.invoke(data);
      if (ret) {
        this._currentNode = node;
        return true;
      }
      return false;
    });
    return ret;
  }

  addChild(node: BehaviourNode) {
    this._children.push(node);
    if ((<Behaviours.ControlFlowNode>node).parent) {
      (<Behaviours.ControlFlowNode>node).parent = node;
    }
  }
}
