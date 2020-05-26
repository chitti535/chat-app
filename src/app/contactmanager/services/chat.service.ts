//import * as io from 'socket.io-client';
import * as io from '../../../../src/socket.io.js';

import { Injectable, QueryList, ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { User, MitronPeer } from '../models/user.js';
import { Message } from '../models/message.js';
import { SignalData, Instance } from 'simple-peer';
import { VideoChatService } from './videochat.service.js';
// import { url } from 'inspector';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private port = 3000;
  private url = 'https://node-chat-api.glitch.me/';
  // private url = `http://localhost:${this.port}`;

  private socket: SocketIOClient.Socket;
  private messageRecievedSubject = new Subject<Message>();
  private chatterSubject = new Subject<User>();
  private chatterRemoveSubject = new Subject<User>();
  private chattersSubject = new Subject<User[]>();
  // private streamSubject = new Subject<any>();
  private loginUser: User;
  private activeUser: User;
  private activeUserSubject = new Subject<User>();
  private users: User[] = [];

  mitronPeers: Array<MitronPeer> = new Array();
  roomName = '';
  private stream: MediaStream;
  private myVideo: HTMLVideoElement;
  private otherUserVideo: HTMLVideoElement;

  constructor(private videoChatService: VideoChatService) {
    this.socket = io(this.url, { transports: ['websocket'] });

    this.socket.on('connect', (data) => {
      const nickName = prompt('What is your name') || 'Anonymous';

      this.socket.emit('join', nickName);
      console.log('connected.');
    });

    this.socket.on('joined', (data) => {
      this.loginUser = new User(data.id, data.name);
    });

    this.socket.on('message', (msg) => {
      console.log('msg recieved' + msg.id + ',' + msg.name + ',' + msg.data);
      let meesage: Message = new Message(msg.id, msg.name, msg.data, msg.from, msg.to);
      meesage.date = msg.date;
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


  sendMessage(data) {
    if (data !== '' && this.activeUser != null) {
      let message: Message = new Message(this.loginUser.id, this.loginUser.name, data, this.loginUser.id, this.activeUser.id);
      message.date = new Date();
      this.socket.emit('send_message', message);
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

  getActiveUser(): Observable<User> {
    return this.activeUserSubject.asObservable();
  }

  setActiveUser(user: User) {
    this.activeUser = user;
    this.activeUserSubject.next(user);
  }

  sendStream(image) {
    this.socket.emit('stream', image);
  }

  // signalling

  disconnect() {
    if (this.mitronPeers != null) {
      const mitronPeer = this.mitronPeers.find(mitronPeer => mitronPeer.peerId === this.socketId);
      mitronPeer.peer.destroy();
    }
  }
  get socketId() {
    return this.socket.id;
  }

  private listen(channel: string, fn: Function) {
    this.socket.on(channel, fn);
  }

  private send(chanel: string, message: SignalMessage) {
    this.socket.emit(chanel, message);
  }

  requestForJoiningRoom(msg: SignalMessage) {
    this.send('room_join_request', msg);
  }

  requestForRoomUsers(msg: SignalMessage) {
    this.send('room_users_request', msg);
  }

  onRoomParticipants(fn: (participants: Array<string>) => void) {
    console.log('client side room users request..');
    this.listen('room_users', fn);
  }

  sendOfferSignal(msg: SignalMessage) {
    this.send('offer_signal', msg);
  }

  onOffer(fn: (msg: SignalMessage) => void) {
    this.listen('offer', fn);
  }

  sendAnswerSignal(msg: SignalMessage) {
    console.log('client side  answer_signal..' + JSON.stringify(msg));
    this.send('answer_signal', msg);
  }

  onAnswer(fn: (msg: SignalMessage) => void) {
    console.log('client side answer..');
    this.listen('answer', fn);
  }

  onRoomLeft(fn: (socketId: string) => void) {
    this.listen('room_left', fn);
  }

  initializeHandlers(stream: MediaStream,  myVideo: HTMLVideoElement, otherUserVideo: HTMLVideoElement) {
    this.myVideo = myVideo;
    this.otherUserVideo = otherUserVideo;
    this.stream = stream;

    this.onRoomParticipants(participants => {
      console.log(`${this.socketId} - On Room Participants`);
      console.log(participants);

      this.initilizePeersAsCaller(participants);
    });

    // this.socket.on('room_users', participants => {
    //   console.log(`${this.socketId} - On Room Participants`);
    //   console.log(participants);
    //   this.initilizePeersAsCaller(participants, stream, peerVideos);
    // });

    this.onOffer(msg => {
      this.initilizePeersAsCallee(msg);
    });

    this.onAnswer(msg => {
      console.log(`${this.socketId} - You got Answer from ${msg.calleeId}`);
      console.log(`${this.socketId} - data  ${JSON.stringify(msg)}`);

      const mitronPeer = this.mitronPeers.find(mitronPeer => mitronPeer.peerId === msg.calleeId);
      mitronPeer.peer.signal(msg.signalData);
    });

    this.onRoomLeft(socketId => {
      this.mitronPeers = this.mitronPeers.filter(mitronPeer => socketId !== mitronPeer.peerId);
    });
  }

  ConnectPeers() {
    this.mitronPeers = [];
    this.requestForRoomUsers({ roomName: this.activeUser.id });
  }

  initilizePeersAsCaller(participants: Array<string>) {
    const participantsExcludingMe = participants.filter(id => id !== this.socketId);
    participantsExcludingMe.forEach(peerId => {

      console.log( this.socketId + ' -- Excluding Me -- Consider -- ' + peerId);
      const peer: Instance = new SimplePeer({
        initiator: true,
        trickle: false,
        config: {
          iceServers: this.videoChatService.myIceServers
        },
        // stream: this.stream
      });

      peer.on('signal', signal => {
        debugger;
        console.log(`${this.socketId} Caller Send Signal -- ${JSON.stringify(signal)}` );
        this.sendOfferSignal({ signalData: signal, callerId: this.socketId, calleeId: peerId });
      });

      peer.on('stream', stream => {
        console.log('streaming in caller');
        this.otherUserVideo.srcObject = stream;
        this.otherUserVideo.play();
      });

      peer.on('connect', () => {
        console.log('CONNECT Caller');
        peer.send('test values ........... from caller to callee');
        peer.addStream(this.stream);
        this.myVideo.srcObject = this.stream;
        this.myVideo.play();
        // this.videoChatService.getMediaStream()
        //   .then((stream) => {
        //     peer.addStream(stream);
        //   })
        //   .catch((err) => {
        //   });
      });

      peer.on('data', data => {
        // got a data channel message
        console.log('got a message from peer: ' + data);
      });

      this.mitronPeers.push({ peerId: peerId, peer: peer });
    });
  }

  initilizePeersAsCallee(msg: SignalMessage) {
    console.log(`${this.socketId} You have an offer from ${msg.callerId}`);
    console.log( this.socketId + ' -- Initiallize calle -- ' + msg.calleeId);
    const peer: Instance = new SimplePeer({
      initiator: false,
      trickle: false,
      config: {
        iceServers: this.videoChatService.myIceServers
      },
      // stream: this.stream
    });

    peer.on('signal', signal => {
      console.log(`${this.socketId} Callee Block ${signal}`);
      this.sendAnswerSignal({ signalData: signal, callerId: msg.callerId, calleeId: msg.calleeId });
    });

    peer.on('stream', stream => {
      console.log('streaming in callee');
      this.otherUserVideo.srcObject = stream;
      this.otherUserVideo.play();
    });

    peer.on('connect', () => {
      console.log('CONNECT Caller');
      peer.send('test data ........ from callee to caller');
      peer.addStream(this.stream);
      this.myVideo.srcObject = this.stream;
      this.myVideo.play();

      // this.videoChatService.getMediaStream()
      //   .then((stream) => {
      //     peer.addStream(stream);
      //   })
      //   .catch((err) => {
      //   });
    });

    peer.on('data', data => {
      // got a data channel message
      console.log('got a message from peer: ' + data);
    });

    peer.signal(msg.signalData);
    this.mitronPeers.push({ peerId: msg.calleeId, peer: peer });
  }
  // end signalling
}

export interface SignalMessage {
  callerId?: string;
  calleeId?: string;
  signalData?: SignalData;
  msg?: string;
  roomName?: string;
}
