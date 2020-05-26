import { Component, OnInit, ViewChild, ElementRef, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { User } from '../../models/user';
import { Message } from '../../models/message';

import { VideoChatService } from '../../services/videochat.service';


@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss']
})
export class MainContentComponent implements OnInit {
  // @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  // public ctx: CanvasRenderingContext2D;
  // @ViewChild('video', { static: true }) video: ElementRef;
  // @ViewChild('image', { static: true }) image: ElementRef;
  // @ViewChild('loggerImage', { static: true }) loggerImage: ElementRef<HTMLElement>;
  @ViewChild('logger', { static: true }) logger: ElementRef<HTMLElement>;

  @ViewChild('myVideoCntrl', { static: true }) myVideoCntrl: ElementRef<HTMLVideoElement>;
  @ViewChild('otherUserVideoCntrl', { static: true }) otherUserVideoCntrl: ElementRef<HTMLVideoElement>;

  myVideo: HTMLVideoElement = null;
  otherUserVideo: HTMLVideoElement = null;

  @ViewChild('peerVideo',  { static: true })  peerVideos: QueryList<ElementRef<HTMLVideoElement>>;


  activeUser: User;
  loginUser: User;
  message = '';
  messages: Message[] = [];
  activeUserMessage: Message[] = [];
  imageSrc;

  stream: MediaStream;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ChatService,
    private videoChatService: VideoChatService) {

    this.service.get().subscribe(message => {
      this.loginUser = this.service.getLoginUser();
      console.log('on message recieve');
      this.messages.push(message);
      this.displayMessages();
    });

    this.service.getActiveUser().subscribe(user => {
      this.activeUser = user;
      this.displayMessages();
    });



    // this.service.getStream().subscribe(image => {
    //   this.imageSrc = image;
    // });

    // this.router.events.subscribe(() => {
    //   const id = this.route.snapshot.paramMap.get('id');
    //   this.userTo = this.service.getUserById(id);
    // });

  }

  ngOnInit() {
    this.myVideo = this.myVideoCntrl.nativeElement;
    this.otherUserVideo = this.otherUserVideoCntrl.nativeElement;

    // this.ctx = this.canvas.nativeElement.getContext('2d');

    this.videoChatService.getMediaStream()
      .then((stream) => {
        this.service.initializeHandlers(stream, this.myVideo, this.otherUserVideo);
      })
      .catch((err) => {
      });

  }

  displayMessages() {
    if (this.activeUser != null) {
      this.activeUserMessage = [];
      this.messages.forEach(message => {
        message.isFrom = false;
        if (message.from === this.loginUser.id) {
          message.isFrom = true;
        }
        if (message.to === this.activeUser.id || message.from === this.activeUser.id ) {
          this.activeUserMessage.push(message);
        }
      });
    }
  }

  sendMessage() {
    this.service.sendMessage(this.message);
    this.message = '';
  }

  connect() {
    this.service.ConnectPeers();
  }

  disconnect() {
    if (this.videoChatService.peerOther != null) {
      this.videoChatService.peerOther.destroy();
      this.service.disconnect();
    }
  }

  loadFail() {
    this.loggMsg('Camera not connected.');
  }

  loggMsg(msg) {
    this.logger.nativeElement.innerHTML = msg;
  }


  // viewVedio(vedio: any, context: CanvasRenderingContext2D) {
  //   this.ctx.drawImage(vedio, 0, 0, 320, 240);
  // }
  // private getMediaStream(): Promise<MediaStream> {
  //   const videoConstraints = { video: true, audio: true };
  //   return new Promise<MediaStream>((resolve, reject) => {
  //     return navigator.mediaDevices.
  //       getUserMedia(videoConstraints)
  //       .then(stream => {
  //         return resolve(stream);
  //       })
  //       .catch(err => reject(err));
  //   });
  // }
  // //End stream related

}
