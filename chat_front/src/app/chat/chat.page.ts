import { Component, OnInit } from '@angular/core';

import { Preferences } from '@capacitor/preferences';
import { NgForm } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { NavController } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  public users: any[] = [];
  public shown: any[] = [];
  username = "";

  constructor(private _http:HttpClient, private router: Router, public navCtrl: NavController) {
    this.getUsers();
  }

  ngOnInit() {
    this.verifyAuth();
  }

  async verifyAuth() {
    const ret = await Preferences.get({ key: 'username' });
    if(!ret.value) this.router.navigate(['/home'])
  }

  async getUsers() {
    const ret = await Preferences.get({ key: 'username' });
    this.username = JSON.parse(ret.value || '{}')

    this._http.get('http://localhost:3000/api/users/get', {observe: 'response'})
    .subscribe((resp:any) => {
      if(resp.status !== 200) return;
      
      this.users = resp.body.filter((user :any) => user.username != JSON.parse(ret.value || '{}')) || {};
      this.shown = this.users
    });
  }

  navigateToChat(userId:String) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
          receiverId: userId
      }
    };
    
    this.navCtrl.navigateForward(['private-chat'], navigationExtras);
  }

  onSubmit(form: NgForm) {
    this.shown = this.users.filter(user => user.username.includes(form.value.search.trim()))
  }

  removeLine() {
    const elem = Array.from(document.getElementsByClassName('input-highlight') as HTMLCollectionOf<HTMLElement>)
    if(elem) elem[0].style.display = "none"
  }
}