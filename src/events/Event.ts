export class Event {
  public type: string;
  public data: any;

  constructor(type: string, data: any = null) {
    this.type = type;
    this.data = data;
  }
}
