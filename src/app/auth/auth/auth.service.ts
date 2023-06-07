import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, tap} from "rxjs/operators";
import {BehaviorSubject, Subject, throwError} from "rxjs";
import {User} from "./user";
import {Router} from "@angular/router";

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenExpirationTimer: any;
  user = new BehaviorSubject<User>(null);

  constructor(private http: HttpClient,
              private router: Router) {
  }

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDfISUZx8S0fcwxjQUNOlkQLSnf5YZYlx4',
      {
        email: email,
        password: password,
        returnSecureToken: true
      }).pipe(catchError(this.handleError), tap((resData:AuthResponseData) => {
        this.handleAuthentication(resData);
      }));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDfISUZx8S0fcwxjQUNOlkQLSnf5YZYlx4',
      {
        email: email,
        password: password,
        returnSecureToken: true
      }).pipe(catchError(this.handleError), tap((resData:AuthResponseData) => {
      this.handleAuthentication(resData);
    }));
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return errorMessage;
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already!';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist.';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct.';
        break;
      case 'USER_DISABLED':
        errorMessage = 'This user is disabled.';
        break;
    }
    return throwError(errorMessage);
    throw new Error('Method not implemented.');
  }

  private handleAuthentication(resData:AuthResponseData) {
    const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
    const user = new User(resData.email, resData.localId, resData.idToken, expirationDate);
    this.user.next(user);
    this.autoLogout(+resData.expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));

  }
  autoLogin(){
    const userData: {
      email:string,
      id:string,
      _token:string,
      _tokenExpirationDate:string
    } = JSON.parse(localStorage.getItem('userData'));
    if(!userData){
      return;
    }
    const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

    if(loadedUser.token){
      this.user.next(loadedUser);
      const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();

    }
  }

  autoLogout(expirationDuration: number){
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if(this.tokenExpirationTimer){
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

}
