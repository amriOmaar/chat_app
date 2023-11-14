import { Component, ElementRef, OnInit, ViewChild, ɵɵNgOnChangesFeature } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { Preferences } from '@capacitor/preferences';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { CallService } from '../core/services/call.service';
import { SignalService } from '../core/services/signal.service';

export interface Message {
  sender: string;
  receiver: string;
  content: String;
  timestamp: Date;
}

@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.page.html',
  styleUrls: ['./private-chat.page.scss'],
})
export class PrivateChatPage implements OnInit {
  @ViewChild('remoteVideo') remoteVideo: ElementRef;
  @ViewChild('localVideo') localVideo: ElementRef;
  incomingOffers: any[] = [];


  socket: any;
  receiverId = "";
  senderId = "";

  messages: Message[] = [];
  incomingCall = false;
  callAccepted = false;
  inCall = false;

  constructor(private route: ActivatedRoute, private _http: HttpClient, private router: Router, private callService: CallService, private signalService: SignalService) {
    this.socket = io('http://localhost:3000');
    this.getUsername();

    this.route.queryParams.subscribe(params => {
      this.receiverId = params["receiverId"];
    });

    this.socket.on("private-message", (message: any) => {
      const newMessage: Message = {
        sender: this.receiverId,
        receiver: this.senderId,
        content: message.content,
        timestamp: message.timestamp
      };

      this.messages = [...this.messages, newMessage];
    });

    // recieved offer
    this.socket.on('offer', async (offer: any, socketId: any) => {
      this.incomingCall = true;
      if (this.callAccepted) {
        this.callService.handleOffer(offer, this.remoteVideo, this.localVideo, this.receiverId);
      } else {
        this.incomingOffers.push({ offer, to: this.receiverId });
      }
    });

    // recieved answer
    this.socket.on('answer', async (answer: any, to: any) => {
      console.log(" i got an answer");
      await this.callService.handleAnswer(answer);
      console.log(this.localVideo);
      console.log(this.remoteVideo);

    });


    this.socket.on('ice-candidate', (data) => {
      const receivedCandidate = new RTCIceCandidate(data.candidate);
      this.callService.handleCandidate(receivedCandidate);
    });
    this.socket.on('end-call', (data) => {
      this.inCall = false;
      this.callAccepted = false;
      this.callService.endCall(this.remoteVideo, this.localVideo);

    });
  }


  ngOnInit() {
    this.verifyAuth();
    this.getMessages();
  }

  removeLine() {
    const elem = Array.from(document.getElementsByClassName('input-highlight') as HTMLCollectionOf<HTMLElement>);
    if (elem) elem[0].style.display = "none";
  }

  async getUsername() {
    const ret = await Preferences.get({ key: 'username' });
    this.senderId = JSON.parse(ret.value || '{}');

    this.socket.emit('setUserName', JSON.parse(ret.value || '{}'));
  }
  async videoCall() {
    this.inCall = true;
    await this.callService.makeCall(this.localVideo, this.remoteVideo, this.receiverId); // Modify your CallService method to handle video calls
  }

  async acceptCall() {
    this.callAccepted = true;
    this.incomingCall = false;
    this.inCall = true;
    // Process any queued offers
    this.incomingOffers.forEach(async ({ offer, to }) => {
      console.log("accepting call from", to);
      await this.callService.handleOffer(offer, this.remoteVideo, this.localVideo, to);
      console.log(this.localVideo);
      console.log(this.remoteVideo);
    });
    // Clear the queue
    this.incomingOffers = [];
  }
  hungUp() {
    this.inCall = false;
    this.callAccepted = false;
    this.signalService.endCall(this.receiverId);
    this.callService.endCall(this.remoteVideo, this.localVideo);
  }
  toggleMic() {
    this.callService.toggleMic();
  }
  toggleCamera() {
    this.callService.toggleCam();
  }

  async getMessages() {
    const ret = await Preferences.get({ key: 'username' });

    this._http.post("http://localhost:3000/api/messages/get", {
      sender: JSON.parse(ret.value || ""),
      receiver: this.receiverId
    }, { observe: 'response' }).subscribe(resp => {
      JSON.parse(JSON.parse(JSON.stringify(resp.body))).forEach((message: any) => {
        const newMessage: Message = {
          sender: message.sender,
          receiver: message.receiver,
          content: message.content,
          timestamp: message.timestamp
        };

        this.messages = [...this.messages, newMessage];
      });
    });
  }

  scrollDiv() {
    let objDiv = document.getElementById("messages");
    if (objDiv) objDiv.scrollTop = (objDiv.scrollHeight + 500);
  }

  async onSubmit(form: NgForm) {
    this.socket.emit("private-message", {
      content: form.value.message,
      to: this.receiverId,
      timestamp: new Date()
    });

    const newMessage: Message = {
      sender: this.senderId,
      receiver: this.receiverId,
      content: form.value.message,
      timestamp: new Date()
    };

    this._http.post("http://localhost:3000/api/messages/add", newMessage, { observe: 'response' }).subscribe(resp => {
      this.messages = [...this.messages, newMessage];
    });

    this.scrollDiv();
    form.reset();
  }

  async verifyAuth() {
    const ret = await Preferences.get({ key: 'username' });
    if (!ret.value) this.router.navigate(['/home']);
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }
}
