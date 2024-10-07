import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.data';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm!: FormGroup;
  email !: String;
  password !: String;
  userFound: boolean = true;
  hiddenPwd: boolean = true;


  constructor(private router: Router, private loginService: LoginService) { }

  ngOnInit() {
   
    this.initLoginForm();

    this.loginForm.statusChanges.subscribe(status => {
      console.log('Form status:', status);
      console.log('Form controls:', this.loginForm.controls);
    });
  }

  initLoginForm() {
    this.loginForm = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }
  onBackClick(){
    this.router.navigate(['/'])
  }

  onSubmit() {

    console.log("da")

    this.email = this.loginForm.get('email')?.value
    this.password = this.loginForm.get('password')?.value




    this.loginService.login<User>(this.loginForm.value).subscribe({
      next: () => {


        console.log("success")
        this.router.navigate(['/'])


      },
      error: () => {
        console.log("error")
        this.userFound = false;
      }
    }
    );

  }
}
