import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ImageInpaintModelResult } from "../models/ImageInpaintModelResult";
import { Injectable, OnInit } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";
import { OnlyPromptsModel } from "../models/OnlyPromptsModel";
import { InpaintService } from "./inpaint.service";

const GET_IMAGES_URL = "http://localhost:5000/gallery/get_all";


@Injectable({
    providedIn: 'root',
})
export class InpaintBackService implements OnInit {
    constructor(private http: HttpClient, private inpaintService: InpaintService) {
    }

    ngOnInit() {

        this.imageInpaintModelResult  = {
            isPublic: false,
            userId: "",
            inputImage: "",
            objectImage: "",
            maskObject: "",
            maskBackground: "",
            promptInpaint: "",
            promptGeneration: "",
            resultImage: "",
        };
    }

    base64ToFile(base64String: string, filename: string): File {

        const byteString = atob(base64String.split(',')[1]);
        const mimeString = base64String.split(',')[0].split(':')[1].split(';')[0];


        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }


        const blob = new Blob([ab], { type: mimeString });
        return new File([blob], filename, { type: mimeString });
    }


    imageInpaintModelResult: ImageInpaintModelResult = {
        isPublic: false,
        userId: "",
        inputImage: "",
        objectImage: "",
        maskObject: "",
        maskBackground: "",
        promptInpaint: "",
        promptGeneration: "",
        resultImage: "",
    };

    clearMaskBackground(){
        this.imageInpaintModelResult.maskBackground = "";
    }
    clearObjectImage(){
        this.imageInpaintModelResult.objectImage = "";
    }

    createResultObject(inputImage: any) {

        this.imageInpaintModelResult.inputImage = this.base64ToFile(inputImage, "inputImage");

    }

    setInputImage(inputImage: any) {
        this.imageInpaintModelResult.inputImage = this.base64ToFile(inputImage, "inputImage");
    }
    setObjectImage(objectImage: any) {
        this.imageInpaintModelResult.objectImage = this.base64ToFile(objectImage, "objectImage");
    }

    setMaskObject(maskObject: any) {
        this.imageInpaintModelResult.maskObject = this.base64ToFile(maskObject, "maskObject");;
    }
    setMaskBackground(maskBackground: any) {
        this.imageInpaintModelResult.maskBackground = this.base64ToFile(maskBackground, "maskBackground");;
    }

    setPromptInpaint(promptInpaint: any) {
        this.imageInpaintModelResult.promptInpaint = promptInpaint;
    }
    setPromptGenration(promptGeneration: any) {
        this.imageInpaintModelResult.promptGeneration = promptGeneration;
    }
    setResultImage(resultImage: any) {
        this.imageInpaintModelResult.resultImage = this.base64ToFile(resultImage, "resultImage");;
    }
    setIsPublic(isPublic: boolean) {
        this.imageInpaintModelResult.isPublic = isPublic;
    }


    saveResultObject() {

        const currentUserString = sessionStorage.getItem('currentUser');
        if (currentUserString) {
            const currentUser = JSON.parse(currentUserString)
            this.imageInpaintModelResult.userId = currentUser.user.id;

        }
        console.log(this.imageInpaintModelResult)



        let onlyPromptsModel: OnlyPromptsModel = {
            promptInpaint: this.imageInpaintModelResult.promptInpaint,
            promptGeneration: this.imageInpaintModelResult.promptGeneration,
            userId: this.imageInpaintModelResult.userId,
            isPublic: this.imageInpaintModelResult.isPublic
        }
        this.addGalleryImage(onlyPromptsModel, this.imageInpaintModelResult.inputImage, this.imageInpaintModelResult.objectImage,
            this.imageInpaintModelResult.maskObject,
            this.imageInpaintModelResult.maskBackground,
            this.imageInpaintModelResult.resultImage

        ).subscribe(data => { console.log(data) })



    }

    addGalleryImage(onlyPromptsModel: any, inputImage: File, objectImage: File, maskObject: File, maskBackground: File, resultImage: File): Observable<any> {

        const ADD_IMAGE_URL: string = `http://localhost:5000/gallery/add`;

        const formData = new FormData();



        formData.append('gallery', JSON.stringify(onlyPromptsModel));
        formData.append('inputImage', inputImage);
        formData.append('objectImage', objectImage);
        formData.append('maskObject', maskObject);
        formData.append('maskBackground', maskBackground);
        formData.append('resultImage', resultImage);

        console.log("PRIVESTEEEE")
        console.log(formData)

        return this.http.post(
            ADD_IMAGE_URL,
            formData
        );
    }


    getGalleryImages(): Observable<any> {
        return this.http.get<any[]>(GET_IMAGES_URL).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    console.log("Unauthorized error");
                }
                return throwError(() => error)
            }))

    }


    getMyCollectionImages(): Observable<any> {


        let id;
        const currentUserString = sessionStorage.getItem('currentUser');
        if (currentUserString) {
            const currentUser = JSON.parse(currentUserString)
            this.imageInpaintModelResult.userId = currentUser.user.id;
            id = currentUser.user.id;

        }

        const GET_MY_COLLECTION_IMAGES_URL = `http://localhost:5000/gallery/get_by_user_id/${id}`;


        return this.http.get<any[]>(GET_MY_COLLECTION_IMAGES_URL).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    console.log("Unauthorized error");
                }
                return throwError(() => error)
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