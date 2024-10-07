import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  
  LOGIN_URL:string=`http://localhost:5000/login`;
  REGISTER_URL:string=`http://localhost:5000/register`;

  constructor(private http: HttpClient) { }

  login<User>(user:any): Observable<any> {

    return this.http.post<User>(this.LOGIN_URL,user).pipe(
        tap(response => {
            if (response) {
            console.log(response);
            sessionStorage.setItem('currentUser', JSON.stringify(response));
            }
          })
        );
  }

  register<User>(user:any): Observable<any> {

    return this.http.post<User>(this.REGISTER_URL,user).pipe(
      catchError((error: HttpErrorResponse)=>
      {
        if(error.status === 401) {
          console.log("Unauthorized error");
        }
        return throwError(()=>error)
      }))
  }

  public handleError(error: HttpErrorResponse) {
    let errorMsg = '';

    if (error?.error instanceof ErrorEvent) {
      errorMsg = `Error: ${error.error.message}`;
    } else {
      errorMsg = error.message;
    }

    return throwError(() => new Error(errorMsg));
  }
}
