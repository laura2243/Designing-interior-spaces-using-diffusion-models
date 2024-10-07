import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.data';
import { LoginService } from 'src/app/services/login.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm!: FormGroup;
  email !: String;
  password !: String;
  passwordRepeat !: String;
  name !: String;

  userFound: boolean = true;
  hiddenPwd: boolean = true;

  passwordsMatch: boolean = true;


  constructor(private router: Router,private loginService: LoginService ) { }

  ngOnInit() {
    this.initRegisterForm();
  }

  initRegisterForm() {
    this.registerForm = new FormGroup({
      name: new FormControl('', Validators.required), 
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      passwordRepeat: new FormControl('', Validators.required),
    });
  }

  onBackClick(){
    this.router.navigate(['/'])
  }

  showMessage: boolean = false;
  successMessage!: string ;
  successBool: boolean = false;

  onSubmit() {
    if (this.registerForm.value.password != this.registerForm.value.passwordRepeat) {
      this.passwordsMatch = false;


    } else {
      const user: User = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
      }

      console.log(user);



      this.loginService.register<User>(user).subscribe({
        next: (entity: User) => {


          if (entity == null) {

            this.successMessage = "Username already exists!"
            this.showMessage = true;
            this.successBool = false;
            
        
            

            // this.notificationService.showPopupMessage("Username already exists!", "OK")
            console.log("Username already exists!")
          } else {
            this.successBool = true;
            this.successMessage = "User registered successfully!"
            this.showMessage = true;

            
        
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 1500);
            
          }




        }, error: () => {

          this.successMessage = "Username already exists!"
          this.showMessage = true; 
          this.successBool = false;
          
          console.log("Email already exists!")
        }
      }

      );

    }
  }

}
