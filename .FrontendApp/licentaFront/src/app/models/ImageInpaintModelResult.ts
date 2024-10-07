export interface ImageInpaintModelResult{
    userId: string;
    inputImage: any;
    objectImage?: any;
    maskObject: any;
    maskBackground?: any;
    promptInpaint: string;
    promptGeneration?: string;
    resultImage: any;
    isPublic: boolean;

    isGenerated?: boolean;
    isImageInpaint?: boolean;
}