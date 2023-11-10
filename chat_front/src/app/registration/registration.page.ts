import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {

  constructor(private _http:HttpClient, private router: Router) { }
  ngOnInit() { }

  onSubmit(form: NgForm) {
    this._http.post('http://localhost:3000/api/users/register', (form.value), {observe: 'response'})
    .subscribe( 
      (resp) => {
        if(resp.status !== 200) return; 
        
        console.log(resp.body);
        this.router.navigate(['/login'])
      },
      (error) => {
        const elem = document.getElementById("error")
        if(elem) elem.style.display = "block"
      }
   );
  }
}
