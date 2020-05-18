import * as io from 'socket.io-client';

import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private url = 'http://localhost:3000';
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
