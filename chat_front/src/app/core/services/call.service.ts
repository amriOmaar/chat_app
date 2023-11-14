import { ElementRef, Injectable } from '@angular/core';
import { SignalService } from './signal.service';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CallService {
  configuration: RTCConfiguration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  connection: RTCPeerConnection;
  stream: MediaStream;
  remoteStream: MediaStream;
  receiverId: any;

  constructor(private signalingService: SignalService, private route: ActivatedRoute) {
  }

  private async _initConnection(remoteVideo: ElementRef, localVideo: ElementRef): Promise<void> {
    this.connection = new RTCPeerConnection(this.configuration);

    await this._getStreams(remoteVideo, localVideo);

    this._registerConnectionListeners();
  }

  public async makeCall(remoteVideo: ElementRef, localVideo: ElementRef, to: string): Promise<void> {
    await this._initConnection(remoteVideo, localVideo);

    const offer = await this.connection.createOffer();

    await this.connection.setLocalDescription(offer);
    await this._getStreams(remoteVideo, localVideo);
    this.signalingService.senderOffer(offer, to);
  }

  public async handleOffer(
    offer: RTCSessionDescription,
    remoteVideo: ElementRef,
    localVideo: ElementRef,
    to: any,
  ): Promise<any> {
    await this._initConnection(remoteVideo, localVideo);
    console.log("setting remote description with offer i got");
    await this.connection.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    const answer = await this.connection.createAnswer();

    await this.connection.setLocalDescription(answer);
    console.log('setting local description with answer');

    this.signalingService.sendAnswer(answer, to);
    console.log('sending answer');

    return answer;
  }

  public async handleAnswer(answer: RTCSessionDescription): Promise<void> {
    await this.connection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  }

  public async handleCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (candidate) {
      await this.connection.addIceCandidate(candidate);
    }
  }

  private _registerConnectionListeners(): void {
    this.connection.onicegatheringstatechange = (ev: Event) => {
      console.log(
        `ICE gathering state changed: ${this.connection.iceGatheringState}`
      );
    };

    this.connection.onconnectionstatechange = () => {
      console.log(
        `Connection state change: ${this.connection.connectionState}`
      );
    };

    this.connection.onsignalingstatechange = () => {
      console.log(`Signaling state change: ${this.connection.signalingState}`);
    };

    this.connection.oniceconnectionstatechange = () => {
      console.log(
        `ICE connection state change: ${this.connection.iceConnectionState}`
      );
    };
    this.connection.onicecandidate = (event) => {
      console.log("(on ice candidate) location description", this.connection.localDescription);
      console.log("(on ice candidate) candidate event", event);
      if (event.candidate) {
        const payload = {
          type: 'candidate',
          candidate: event.candidate.toJSON(),
        };
        this.route.queryParams.subscribe(params => {
          this.receiverId = params["receiverId"];
        });
        this.signalingService.sendCandidate(payload, this.receiverId);
      }
    };
  }

  private async _getStreams(remoteVideo: ElementRef, localVideo: ElementRef): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    this.remoteStream = new MediaStream();

    localVideo.nativeElement.srcObject = this.stream;


    remoteVideo.nativeElement.srcObject = this.remoteStream;

    this.connection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
    };


    this.stream.getTracks().forEach((track) => {
      this.connection.addTrack(track, this.stream);
    });

  }

  endCall(remoteVideo: any, localVideo: any) {
    this.stream.getTracks().forEach((track) => track.stop());
    localVideo.srcObject = null;

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
    }
    remoteVideo.srcObject = null;
    this.connection.close();
  }
}
