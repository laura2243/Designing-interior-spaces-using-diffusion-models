export interface TextInpaintModel{
    image: string;
    mask: string;
    prompt: string;
    strength: number;
    isSDXLModel: boolean;
}