import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  formTypes = {
    new: 'new',
    old: 'old',
    guest: 'guest',
    forgot: 'forgot'
  }

  memberForm: FormGroup;
  newMember = false;
  guest = true;
  forgot = false;
  state = this.formTypes.guest;

  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthService
  ) {
    this.memberForm = this.formBuilder.group({
      email: [''],
      password: [''],
      username: ['']
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    return this.memberForm.value;
  }

  setState(state: any) {
    this.state = state;
    switch (this.state) {
      case this.formTypes.new:
        this.memberForm = this.formBuilder.group({
          email: [this.memberForm.value.email],
          password: [this.memberForm.value.password],
          username: [this.memberForm.value.username]
        });
        break;
      case this.formTypes.old:
        this.memberForm = this.formBuilder.group({
          email: [this.memberForm.value.email],
          password: [this.memberForm.value.password]
        });
        break;
      case this.formTypes.guest:
        this.memberForm = this.formBuilder.group({
          username: [this.memberForm.value.username]
        });
        break;
      case this.formTypes.forgot:
        this.memberForm = this.formBuilder.group({
          email: [this.memberForm.value.email]
        });
        break;
      default:
        break;
    }
  }

  signUp() {
    if (this.memberForm.valid) {
      this.authService.SignUp(this.memberForm.value.email, this.memberForm.value.password, this.memberForm.value.username);
    }
  }

  signIn() {
    if (this.memberForm.valid) {
      this.authService.SignIn(this.memberForm.value.email, this.memberForm.value.password);
    }
  }

  guestSignIn() {
      this.authService.SignInGuest(this.memberForm.value.username);
  }

  resetPassword() {
    if (this.memberForm.valid) {
      this.authService.ForgotPassword(this.memberForm.value.email);
      this.setState(this.formTypes.old);
    }
  }

}
