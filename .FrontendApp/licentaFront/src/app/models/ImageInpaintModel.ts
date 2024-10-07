export interface ImageInpaintModel{
    inputImage: string;
    maskObject: string;
    maskBackground: string;
    inputImageObject: string;
    prompt: string;
    strength: number;
}