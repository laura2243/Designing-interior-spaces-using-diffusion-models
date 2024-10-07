import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { User } from '../models/user.data';


@Injectable({
  providedIn: 'root'
})
export class PromptAssistantService {
  
  SEND_MESSAGE_URL:string=`http://localhost:5000/prompt-assistant`;



  constructor(private http: HttpClient) { }

  sendMessageToPromptAssistant(message: string): Observable<any> {

    return this.http.post(this.SEND_MESSAGE_URL,{message},{ responseType: 'text' }).pipe(
        catchError((error: HttpErrorResponse)=>
        {
          if(error.status === 401) {
            console.log("Unauthorized error");
          }
          return throwError(()=>error)
        }))
  }



}
