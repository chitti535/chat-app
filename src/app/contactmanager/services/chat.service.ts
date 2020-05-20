//import * as io from 'socket.io-client';
import * as io from '../../../../src/socket.io.js';

import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
// import { url } from 'inspector';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // private port = 3000;
  private url = 'https://node-chat-api.glitch.me/';
  // private url = `http://localhost:${ this.port}`;
  private socket;
  private subject = new Subject<any>();
  private chattersSubject = new Subject<any>();
  private chattersRemoveSubject = new Subject<any>();

  constructor() {
    this.socket = io(this.url);

    this.socket.on('connect', (data) => {
      const nickName = prompt('What is your name');
      if (nickName) {
        this.socket.emit('join', nickName);
      }
      console.log('connected.');
    });

    this.socket.on('message', (data) => {
      this.subject.next({ text: data });
    });

    this.socket.on('add chatter', (data) => {
      this.chattersSubject.next({ name: data });
    });

    this.socket.on('remove chatter', (data) => {
      this.chattersRemoveSubject.next({ name: data });
    });

  }

  send(data) {
    this.socket.emit('messages', data);
  }

  get(): Observable<any> {
    return this.subject.asObservable();
  }

  addChatter(): Observable<any> {
    return this.chattersSubject.asObservable();
  }

  removeChatter(): Observable<any> {
    return this.chattersRemoveSubject.asObservable();
  }
}
