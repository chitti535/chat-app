//import * as io from 'socket.io-client';
import * as io from '../../../../src/socket.io.js';

import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { User } from '../models/user.js';
import { Message } from '../models/message.js';
// import { url } from 'inspector';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private port = 3000;
  private url = 'https://node-chat-api.glitch.me/';
  // private url = `http://localhost:${ this.port}`;

  private socket;
  private messageRecievedSubject = new Subject<Message>();
  private chatterSubject = new Subject<User>();
  private chatterRemoveSubject = new Subject<User>();
  private chattersSubject = new Subject<User[]>();
  private loginUser: User;
  private users: User[] = [];


  constructor() {
    this.socket = io(this.url, {transports: ['websocket']});

    this.socket.on('connect', (data) => {
      const nickName = prompt('What is your name') || 'Anonymous';

      if (nickName) {
        this.socket.emit('join', nickName);
      }
      console.log('connected.');
    });

    this.socket.on('joined', (data) => {
      this.loginUser = new User(data.id, data.name);
    });

    this.socket.on('message', (msg) => {
      console.log('msg recieved' + msg.id + ',' + msg.name + ',' + msg.data);
      const meesage: Message = new Message(msg.id, msg.name, msg.data);
      debugger
      this.messageRecievedSubject.next(meesage);
    });

    this.socket.on('add chatter', (data) => {
      const user: User = new User(data.id, data.name);
      this.chatterSubject.next(user);
    });

    this.socket.on('remove chatter', (data) => {
      const user: User = new User(data.id, data.name);
      this.chatterRemoveSubject.next(user);
    });

    this.socket.on('allusers', (data) => {
      console.log('user list..' + data);
      this.users = [];
      data.forEach(item => {
        if (item.id !== this.loginUser.id) { // skip log in user from user list
          this.users.push(new User(item.id, item.name));
        }
      });
      this.chattersSubject.next(this.users);
    });

  }

  send(data) {
    if (data !== '') {
      this.socket.emit('message', data);
    }
  }

  get(): Observable<Message> {
    return this.messageRecievedSubject.asObservable();
  }

  getUsers(): Observable<User[]> {
    return this.chattersSubject.asObservable();
  }

  getUserById(id: string): User {
    const user: User = this.users.find(x => x.id === id);
    return user;
  }

  addChatter(): Observable<User> {
    return this.chatterSubject.asObservable();
  }

  removeChatter(): Observable<User> {
    return this.chatterRemoveSubject.asObservable();
  }

  getLoginUser(): User {
    return this.loginUser;
  }
}
