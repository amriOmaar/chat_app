import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrivateChatPageRoutingModule } from './private-chat-routing.module';

import { PrivateChatPage } from './private-chat.page';
import { CallService } from '../core/services/call.service';
import { SignalService } from '../core/services/signal.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrivateChatPageRoutingModule
  ],
  declarations: [PrivateChatPage],
  providers: [CallService, SignalService]
})
export class PrivateChatPageModule { }
