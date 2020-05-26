import { Instance, SignalData } from 'simple-peer';

export class User {
  id: string;
  name: string;
  bio?: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export interface MitronPeer {
  peerId: string;
  peer: Instance;
}
