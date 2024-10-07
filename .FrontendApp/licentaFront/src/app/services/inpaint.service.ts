import { Injectable } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { TextInpaintModel } from "../models/TextInpaintModel";
import { ImageInpaintModel } from "../models/ImageInpaintModel";
import { LamaModel } from "../models/LamaModel";
import { GenerateImageModel } from "../models/GenerateImageModel";
import { OnlyPromptsModel } from "../models/OnlyPromptsModel";


const textInpaintAPI = "https://ferret-genuine-fully.ngrok-free.app/textInpaintObject"
const imageInpaintAPI = "https://subtly-assuring-gobbler.ngrok-free.app/imageInpaintObject"
const lamaAPI = "https://ferret-genuine-fully.ngrok-free.app/lama"
const generateAPI = "https://ferret-genuine-fully.ngrok-free.app/generate"
const GET_IMAGES_URL = "http://localhost:5000/gallery/get_all";


@Injectable({
    providedIn: 'root',
})
export class InpaintService {
    constructor(private http: HttpClient) {
    }

    public getTextInapint(textInpaintModel: TextInpaintModel): Observable<any> {
        return this.http.post(
            textInpaintAPI, textInpaintModel
        );
    }

    public getImageInpaint(imageInpaintModel: ImageInpaintModel): Observable<any> {
        return this.http.post(
            imageInpaintAPI, imageInpaintModel
        );
    }
    
    public getLamaImage(lamaModel: LamaModel): Observable<any> {
        return this.http.post(
            lamaAPI, lamaModel
        );
    }
    public generateImages(generateImageModel: GenerateImageModel): Observable<any> {
        if (generateImageModel.negative_prompt == '' || generateImageModel.negative_prompt == null || generateImageModel.negative_prompt == undefined)
        {
            generateImageModel.negative_prompt = "unrealistic, low resolution, painting, cartoon, unfinished objects" 
        }
        console.log(generateImageModel.negative_prompt)
        return this.http.post(
            generateAPI, generateImageModel
        );
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