import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private _http:HttpClient, private router: Router) { }

  ngOnInit() {
  }

  onSubmit(form: NgForm) {
    this._http.post('http://localhost:3000/api/users/login', (form.value), {observe: 'response'})
    .subscribe( 
      (resp) => {
        if(resp.status !== 200) return; 
        
        console.log(resp.body);
        this.setObject(form);
        this.router.navigate(['/chat'])
      },
      (error) => {
        const elem = document.getElementById("error")
        if(elem) elem.style.display = "block"
      }
   );
  }

  async setObject(form: NgForm) {
    await Preferences.set({
      key: 'username',
      value: JSON.stringify(form.value.username)
    });
  }
}
