export interface ResultImagesModel{
    input_image: any;
    object_image?: any;
    mask_object: any;
    mask_background?: any;
    prompt_inpaint: string;
    prompt_generation?: string;
    result_image: any;

    isGenerated?: boolean;
    isImageInpaint?: boolean;
}