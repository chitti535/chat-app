export class Message {
  id: string;
  name: string;
  data: string;
  date?: Date;
  isFrom?: boolean;
  from?: string;
  to?: string;

  constructor(id: string, name: string, data: string, from: string, to: string) {
    this.id = id;
    this.name = name;
    this.data = data;
    this.from = from;
    this.to = to;
  }
}
