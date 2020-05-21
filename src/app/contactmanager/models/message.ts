export class Message {
  id: string;
  name: string;
  data: string;
  date: Date;
  isFrom: boolean;

  constructor(id: string, name: string, data: string) {
    this.id = id;
    this.name = name;
    this.data = data;
  }
}
