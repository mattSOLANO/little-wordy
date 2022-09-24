import { Injectable, NgZone } from '@angular/core';
import { ref, getDatabase, push, set, connectDatabaseEmulator} from '@angular/fire/database';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInAnonymously, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  connectAuthEmulator,
  updateProfile
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  auth = getAuth();
  
  db = getDatabase();
  localUser = localStorage.getItem('user');
  userData = this.localUser ? JSON.parse(this.localUser) : null; // Save logged in user data

  constructor(
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {

    connectAuthEmulator(this.auth, "http://localhost:9099");
    if(location.hostname === "localhost") {
      connectDatabaseEmulator(this.db, "localhost", 9000);
    }

    /* Saving user data in localstorage when
    logged in and setting up null when logged out */
    // this.afAuth.authState.subscribe(user => {
    this.auth.onAuthStateChanged((user: any) => {
        if (user) {
            this.userData = user;
            localStorage.setItem('user', JSON.stringify(this.userData));
            // JSON.parse(localStorage.getItem('user') || '{}');
        } else {
            localStorage.setItem('user', '');
            // JSON.parse(localStorage.getItem('user') || '{}');
        }
    });
  }

  // Sign in with email/password
  SignIn(email: string, password: string) {
    signInWithEmailAndPassword( this.auth, email, password)
      .then((result: any) => {
        this.SetUserData(result.user);
        this.ngZone.run(() => {
          this.router.navigate(['dashboard']);
        });
      }).catch((error: any) => {
        window.alert(error.message);
      });
  }

  SignInGuest(username: string) {
    signInAnonymously(this.auth)
      .then((result: any) => {

        updateProfile(result.user, {
          displayName: username
        }).then( () => {
          this.SetGuestUserData(result.user);
          this.ngZone.run(() => {
            this.router.navigate(['dashboard']);
          });
        });
        
      }).catch((error: any) => {
        window.alert(error.message);
      });
  }

  // Sign up with email/password
  SignUp(email: string, password: string, username: string) {
    createUserWithEmailAndPassword( this.auth, email, password)
      .then((result: any) => {
        /* Call the SendVerificaitonMail() function when new user sign
        up and returns promise */
        // this.SendVerificationMail();
        updateProfile(result.user, {
          displayName: username
        }).then( () => {
            this.SetUserData(result.user);
            this.ngZone.run(() => {
                this.router.navigate(['dashboard']);
            });
        });
      }).catch((error: any) => {
        window.alert(error.message);
      });
  }

  // Send email verfificaiton when new user sign up
//   SendVerificationMail() {
//     return this.afAuth.currentUser.sendEmailVerification()
//     .then(() => {
//       this.router.navigate(['verify-email-address']);
//     });
//   }

  // Reset Forggot password
  ForgotPassword(passwordResetEmail: string) {
    sendPasswordResetEmail(this.auth, passwordResetEmail)
    .then(() => {
      window.alert('Password reset email sent, check your inbox.');
    }).catch((error: any) => {
      window.alert(error);
    });
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = localStorage.getItem('user');
    return user !== null;
  }

  // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new GoogleAuthProvider());
  }

  // Auth logic to run auth providers
  AuthLogin(provider: any) {
    signInWithPopup(this.auth, provider)
    .then((result: any) => {
        this.ngZone.run(() => {
          this.router.navigate(['dashboard']);
        });
        this.SetUserData(result.user);
    }).catch((error: any) => {
      window.alert(error);
    });
  }

  /* Setting up user data when sign in with username/password,
  sign up with username/password and sign in with social auth
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user: User) {
    const userRef = ref(this.db, `users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    };
    
    set(userRef, userData);
  }

  SetGuestUserData(user: User) {
    const userRef = ref(this.db, `users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: '',
      displayName: user.displayName
    };
    
    set(userRef, userData);
  }

  // Sign out
  SignOut() {
    return this.auth.signOut().then(() => {
        localStorage.removeItem('user');
        this.router.navigate(['home']);
    });
  }

}
