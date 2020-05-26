import { Injectable } from '@angular/core';
import { Instance, SignalData } from 'simple-peer';
import { MitronPeer } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class VideoChatService {
  loggerMsg = '';

  peer1: Instance = null;
  peerOther: Instance = null;

  myIceServers = [
    {
      'urls': 'stun:numb.viagenie.ca',
    },
    {
      'urls': 'turn:numb.viagenie.ca',
      'username': 'chitti535@gmail.com',
      'credential': 'chitti@turn'
    }
  ];

  constructor() {
  }

  getMediaStream(): Promise<MediaStream> {
    const videoConstraints = { video: true, audio: true };
    return new Promise<MediaStream>((resolve, reject) => {
      return navigator.mediaDevices.
        getUserMedia(videoConstraints)
        .then(stream => {
          return resolve(stream);
        })
        .catch(err => reject(err));
    });
  }

  createPeer(stream, myVideo: HTMLVideoElement, otherUserVideo: HTMLVideoElement) {
    let peer2: Instance = null;
    this.peer1 = new SimplePeer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: this.myIceServers
      },
      stream: stream
    });

    peer2 = new SimplePeer({
      initiator: false,
      trickle: false,
      config: {
        iceServers: this.myIceServers
      }
    });
    this.peerOther = peer2;

    this.peer1.on('connect', () => {
      myVideo.srcObject = stream;
      myVideo.play();
    });

    this.peer1.on('signal', data => {
      peer2.signal(data);
    });

    peer2.on('signal', data => {
      this.peer1.signal(data);
    });

    peer2.on('stream', stream => {
      // got remote video stream, now let's show it in a video tag
      if ('srcObject' in otherUserVideo) {
        otherUserVideo.srcObject = stream;
      } else {
        // otherUserVideo.src = window.URL.createObjectURL(stream); // for older browsers
      }

      otherUserVideo.play();
    });
  }
}


