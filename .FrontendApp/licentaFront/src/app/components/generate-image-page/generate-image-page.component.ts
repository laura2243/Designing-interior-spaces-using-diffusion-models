import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GenerateImageModel } from 'src/app/models/GenerateImageModel';
import { InpaintService } from 'src/app/services/inpaint.service';
import { InpaintBackService } from 'src/app/services/inpaintBack.service';

@Component({
  selector: 'app-generate-image-page',
  templateUrl: './generate-image-page.component.html',
  styleUrls: ['./generate-image-page.component.css']
})
export class GenerateImagePageComponent implements OnInit {


  isCollapsedNegPrompt: boolean = false;
  isCollapsedGenParams: boolean = false;
  isCollapsedSeed: boolean = false;
  useAssistant: boolean = false;

  numberOfImages: number = 2;
  strength: number = 0.8;
  steps: number = 20;

  generatingImages: boolean = false;

  imageInpaintForm !: FormGroup;
  promptText: string = '';
  negativePromptText: string = '';
  seed: string = '';


  loading: boolean = false;
  fromGenerate: boolean = true;
  generatedImages: any[] = [];

  constructor(private router: Router, private inpaintService: InpaintService, private route: ActivatedRoute, private inpaintBackService: InpaintBackService) { }
  ngOnInit() {

    this.initForm();

    this.route.queryParams.subscribe(params => {

      if (params['reloadPage'] && params['reloadPage'] == 'true') {

        this.generatedImages = []
        this.loading = false;
        this.fromGenerate = true;
        this.generatingImages = false
      }
    })
  }

  initForm() {
    this.imageInpaintForm = new FormGroup({
      promptText: new FormControl('', Validators.required),
      negativePromptText: new FormControl(''),
      seed: new FormControl('')

    });
  }


  onSliderChange(event: Event) {
    var slider = event.target as HTMLInputElement;
    var sliderValue = document.getElementById('sliderValue') as HTMLInputElement;
    sliderValue.value = slider.value
    this.strength = Number(sliderValue.value)
    this.updateBackground(slider, parseFloat(slider.min), parseFloat(slider.value));
  }

  onSliderChangeSteps(event: Event) {
    var slider = event.target as HTMLInputElement;
    var sliderValue = document.getElementById('sliderValueSteps') as HTMLInputElement;
    sliderValue.value = slider.value
    this.steps = Number(sliderValue.value)
    this.updateBackground(slider, parseFloat(slider.min), parseFloat(slider.value));
  }
  onSliderChangeNumberOfImages(event: Event) {
    var slider = event.target as HTMLInputElement;
    var sliderValue = document.getElementById('sliderValueNumberOfImages') as HTMLInputElement;
    sliderValue.value = slider.value
    this.numberOfImages = Number(slider.value)
    this.updateBackground(slider, parseFloat(slider.min), parseFloat(slider.value));
  }

  updateBackground(slider: HTMLInputElement, minValue: number, value: number) {
    slider.style.background = `linear-gradient(to right, black 0%, gray ${(value - minValue) / (parseFloat(slider.max) - minValue) * 100 - 1}%, #DEE2E6 ${(value - minValue) / (parseFloat(slider.max) - minValue) * 100}%, #DEE2E6 100%)`;
  }
  collapsedNegPrompt() {
    this.isCollapsedNegPrompt = !this.isCollapsedNegPrompt;
  }
  collapsedGenParams() {
    this.isCollapsedGenParams = !this.isCollapsedGenParams;
  }
  collapsedSeed() {
    this.isCollapsedSeed = !this.isCollapsedSeed;
  }


  onUseAssistantClick() {
    this.useAssistant = true;
  }

  handleChatPrompt(prompt: string) {

    this.promptText = prompt;
    console.log(prompt);
    this.imageInpaintForm.value.promptText = prompt;
    this.imageInpaintForm.get('promptText')?.setValue(prompt);

  }
  onGenerateClick() {

    console.log(this.strength);
    console.log(this.numberOfImages);
    console.log(this.steps);

    // this.generatingImages = true;

    const generateImageModel: GenerateImageModel = {
      prompt: this.imageInpaintForm.value.promptText,
      negative_prompt: this.imageInpaintForm.value.negativePromptText,
      strength: this.strength,
      number_of_images: this.numberOfImages,
      steps: this.steps,
      seed: this.imageInpaintForm.value.seed
    }

    console.log(generateImageModel)
    this.loading = true;

    this.inpaintService.generateImages(generateImageModel).pipe().subscribe(response => {
      this.loading = false
      console.log(response as string)

      this.generatedImages = response.images
      this.generatedImages = this.generatedImages.map((image: any) => { image = "data:image/jpeg;base64," + image; return image })

      this.generatingImages = true;

      this.inpaintBackService.setPromptGenration(this.imageInpaintForm.value.promptText)

      // this.generatedImage = inpaintedImages
      // this.isImageGenerated = true
      // this.imageSelected = false
      // this.fromGenerate = false;



    }, () => {
      console.log("error")

    })




  }

  tooltipTextPrompt = "Enter a description to guide the AI in creating your image."
  tooltipTextNegativePrompt = "Use this to steer the AI away from certain themes or elements in your image."
  tooltipStrength = "How strictly the model will stick to the prompt. "
  tooltipSeed = "Enter a number to get a unique starting point for generating images."
  tooltipSteps = "Number of iterations in order to generate your image. "
  hover: boolean = false;
  hoverNegativePrompt: boolean = false;
  hoverStrength: boolean = false;
  hoverSeed: boolean = false;
  hoverSteps: boolean = false;

  showText() {
    this.hover = true;
  }
  hideText() {
    this.hover = false;
  }
  showTextStrength() {
    this.hoverStrength = true;
  }
  hideTextStrength() {
    this.hoverStrength = false;
  }
  showTextSeed() {
    this.hoverSeed = true;
  }
  hideTextSeed() {
    this.hoverSeed = false;

  }
  showTextSteps() {
    this.hoverSteps = true;
  }
  hideTextSteps() {
    this.hoverSteps = false;

  }
  showTextNegativePrompt() {
    this.hoverNegativePrompt = true;
  }
  hideTextNegativePrompt() {
    this.hoverNegativePrompt = false;

  }

  handleClickedgeneratedImage(image: any) {
    console.log(image);
    console.log("aici")

    this.router.navigate(['/home'], {
      queryParams: {
        image: image
      }
    })
  }

}
