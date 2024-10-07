export interface GenerateImageModel{
    prompt: string;
    negative_prompt: string;
    strength: number;
    steps: number;
    number_of_images: number;
    seed: number;
}