import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TextInpaintModel } from 'src/app/models/TextInpaintModel';
import { InpaintService } from 'src/app/services/inpaint.service';
import { GenerateImageModel } from 'src/app/models/GenerateImageModel';
import { delay, range } from 'rxjs';
import { ImageInpaintModel } from 'src/app/models/ImageInpaintModel';
import { LamaModel } from 'src/app/models/LamaModel';
import { InpaintBackService } from 'src/app/services/inpaintBack.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger(
      'collapseAnimation',
      [
        state('false', style({ opacity: 0 })),
        transition(
          ':enter',
          [
            style({ height: 0, opacity: 0 }),
            animate('0.7s ease-out',
              style({ height: 200, opacity: 1 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: 200, opacity: 1 }),
            animate('0.7s ease-in',
              style({ height: 0, opacity: 0 }))
          ]
        ),

      ]
    )
  ]

})
export class DashboardComponent implements OnInit {



  show: boolean = false
  isCollapsedMask: boolean = false;
  isCollapsedObj: boolean = false;
  isMaskGenerated: boolean = false;
  // isMaskGenerated: boolean = true; //only for design 
  isUploadeButtonPressed: boolean = false;
  textButton: string = 'Inpaint';
  highlightedImage: any;
  maskObject: any;
  maskBackground: any;

  textInpaintForm !: FormGroup;
  promptText: string = '';

  isImageGenerated: boolean = false;
  generatedImage: any; // MUST BE ARRAY
  loading: boolean = false;


  //Image generation Parameters
  generateImageModel!: GenerateImageModel;
  generatingImages: boolean = false;

  strengthValue: number = 0.8;

  lamaImage: any;
  generatedImageFromModel: any;

  isChecked = false;





  constructor(private cdr: ChangeDetectorRef, private elementRef: ElementRef, private router: Router, private inpaintService: InpaintService, private route: ActivatedRoute,
    private inpaintBackService: InpaintBackService
  ) { }

  ngOnInit() {



    this.isCollapsedMask = false;
    this.madeMasksBool = false;


    this.generatingImages = false;
    this.isImageGenerated = false;
    this.loading = false;

    const slider = document.getElementById('line') as HTMLInputElement;
    const sliderValue = document.getElementById('sliderValue') as HTMLInputElement;
    sliderValue.value = slider.value
    this.updateBackground(slider, parseFloat(slider.min), parseFloat(slider.value));
    // this.imageSelected = true;

    this.initForm();

    this.route.queryParams.subscribe(params => {
      const prompt = params['prompt'];
      const negativePrompt = params['negativePrompt'];
      const strength = params['strength'];
      const numberOfImages = params['numberOfImages'];
      const steps = params['steps'];
      const seed = params['seed'];


      this.generateImageModel = {
        prompt: prompt,
        negative_prompt: negativePrompt,
        strength: strength,
        number_of_images: numberOfImages,
        steps: steps,
        seed: seed
      }

    });

    if (this.generateImageModel.prompt != undefined) {

      // console.log(this.generateImageModel)
      this.generatingImages = true;
      this.generateImagesCall(this.generateImageModel)
      // this.loading = true;
    }


    this.route.queryParams.subscribe(params => {

      const image = params['image'];
      this.generatedImageFromModel = image
    })
    if (this.generatedImageFromModel != undefined && this.generatedImageFromModel != null) {

      // console.log("a ajuns")
      // console.log(this.generatedImageFromModel)

      this.isUploadeButtonPressed = true;
      this.textButton = 'Generate Mask';
      this.imageSelected = true;
      this.showImg = this.generatedImageFromModel
      this.coverImgFile = this.base64ToFile(this.generatedImageFromModel, "generatedImage")
    }


    this.route.queryParams.subscribe(params => {



      if (params['reinpaint'] && params['reinpaint'] == 'true') {
        this.reinpaint()

      }

      this.router.navigate([], {
        queryParams: {
          'reinpaint': null

        },
        queryParamsHandling: 'merge'
      })
    })



    this.route.queryParams.subscribe(params => {


      if (params['continueInpaint'] && params['continueInpaint'] == 'true') {
        this.continueInpaint(params['continueInpaintImage'])
      }

      const queryParams = { ...this.route.snapshot.queryParams };
      delete queryParams['continueInpaintImage'];
      delete queryParams['continueInpaint'];
    })

  }

  continueInpaint(image: any) {
    this.isUploadeButtonPressed = true;
    this.textButton = 'Generate Mask';
    this.imageSelected = true;
    this.isUploadeButtonPressed = true;
    this.isMaskGenerated = false;

    this.showImg = image
    this.coverImgFile = this.base64ToFile(image, "image")
    console.log(this.showImg)

    this.isCollapsedMask = false;
    this.isCollapsedObj = false;

    this.initForm()

    this.objectImageSelected = false;
    
    console.log(this.objectImageSelected)
    this.showObjImg = null;

    this.isSdSelected = false;
    this.isSdxlSelected = true;

    this.isImageGenerated = false;

    this.objectImage = undefined;

    this.inpaintBackService.clearObjectImage()
    this.inpaintBackService.clearMaskBackground()

    

  }


  reinpaint() {
    this.isUploadeButtonPressed = true;
    this.textButton = 'Generate Mask';
    this.imageSelected = true;
    this.isUploadeButtonPressed = true;
    this.isMaskGenerated = false;
    console.log(this.showImg)

    this.isCollapsedMask = false;
    this.isCollapsedObj = false;
    this.initForm()

    this.objectImageSelected = false;
    this.showObjImg = null;

    this.isSdSelected = false;
    this.isSdxlSelected = true;

    this.isImageGenerated = false;

    this.objectImage = undefined;


    this.inpaintBackService.setObjectImage("")
    this.inpaintBackService.setMaskBackground("")

  


  }

  base64ToFile(base64String: string, filename: string): File {
    // Decode base64 string
    const byteString = atob(base64String.split(',')[1]);
    const mimeString = base64String.split(',')[0].split(':')[1].split(';')[0];

    // Create an ArrayBuffer and a view (as a binary array)
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // Create a blob from the binary array
    const blob = new Blob([ab], { type: mimeString });

    // Create a File from the blob
    return new File([blob], filename, { type: mimeString });
  }

  // GENERATING IMAGES 

  generatedImages: any[] = [];
  generateImagesCall(generateImageModel: GenerateImageModel) {

    // call backend to generate images
    // this.loading = true;

    // setTimeout(() => {
    //   this.loading = true;
    //   console.log("inthefunction")


    // }, 500);


    // this.inpaintService.generateImages(generateImageModel).pipe().subscribe(response => {
    //   this.loading = false
    //   console.log(response as string)

    //   this.generatedImages = response.images
    //   this.generatedImages = this.generatedImages.map((image: any) => { image = "data:image/jpeg;base64," + image; return image })

    //   this.generatingImages = true;

    //   // this.generatedImage = inpaintedImages
    //   // this.isImageGenerated = true
    //   // this.imageSelected = false
    //   // this.fromGenerate = false;


    //   this.fromGenerate = true;
    //   this.isImageGenerated = true

    // }, () => {
    //   console.log("error")

    // })



  }

  initForm() {
    this.textInpaintForm = new FormGroup({
      promptText: new FormControl('', Validators.required),

    });
  }

  onSliderChange(event: Event) {
    const slider = event.target as HTMLInputElement;
    const sliderValue = document.getElementById('sliderValue') as HTMLInputElement;
    sliderValue.value = slider.value
    this.strengthValue = Number(slider.value)
    this.updateBackground(slider, parseFloat(slider.min), parseFloat(slider.value));
  }

  updateBackground(slider: HTMLInputElement, minValue: number, value: number) {
    slider.style.background = `linear-gradient(to right, black 0%, gray ${(value - minValue) / (parseFloat(slider.max) - minValue) * 100 - 1}%, #DEE2E6 ${(value - minValue) / (parseFloat(slider.max) - minValue) * 100}%, #DEE2E6 100%)`;
  }

  collapsedMask() {
    this.isCollapsedMask = !this.isCollapsedMask;

  }

  collapsedObj() {
    this.isCollapsedObj = !this.isCollapsedObj;
  }

  showImg !: any;
  coverImgFile!: File;
  coverImgFileName!: string;
  imageSelected: boolean = false;
  objectImage!: File | undefined;
  objectImageName!: string;
  showObjImg!: any;
  objectImageSelected: boolean = false;
  madeMasksBool: boolean = false;

  isSdSelected: boolean = false;
  isSdxlSelected: boolean = true;


  onFileSelected(event: any) {
    this.isUploadeButtonPressed = true;
    this.textButton = 'Generate Mask';


    this.coverImgFile = event.target.files[0];
    this.coverImgFileName = this.coverImgFile.name;
    this.imageSelected = true;
    this.showImg = URL.createObjectURL(event.target.files[0]);


  }


  onFileSelectedObject(event: any) {

    this.objectImage = event.target.files[0];
    this.objectImageName = this.objectImage!.name;
    this.objectImageSelected = true;
    setTimeout(() => {
      this.show = true;
    }, 1000);
    this.showObjImg = URL.createObjectURL(event.target.files[0]);

    this.isSdSelected = false;
    this.isSdxlSelected = true;


    //convert to bytes array
    var objectStream = ''

    if (this.objectImage) {
      this.convertToDataURL(this.objectImage).then((dataUrl) => {
        objectStream = dataUrl;
        // console.log(objectStream)

      })
    }


    const inputElement = document.getElementById('removeImageIconContainer') as HTMLInputElement;
    if (inputElement) {
      inputElement.blur(); // Remove focus from the input
    }
  }


  onGenerateClick() {
    this.router.navigate(['/generate']);
  }

  fromGenerate: boolean = false;
  onButtonClick() {

    if (this.textButton == 'Generate Mask' && this.highlightedImage != undefined && this.highlightedImage != null) {


      this.loading = true
      this.convertToDataURL(this.coverImgFile).then((dataUrl) => {
        imageStream = dataUrl;



        const lamaModel: LamaModel = {
          inputImage: imageStream,
          maskObject: this.maskObject,
        }

        this.inpaintBackService.setMaskObject(this.maskObject)
        this.inpaintBackService.setMaskBackground(this.maskBackground)

        this.inpaintService.getLamaImage(lamaModel).pipe().subscribe(response => {
          this.loading = false
          this.isImageGenerated = false
          // console.log(response as string)
          const imageUrlLama = "data:image/jpeg;base64," + response.image
          console.log(imageUrlLama)
          this.lamaImage = imageUrlLama

        }, error => {
          console.log("error")

        })
      }, error => {
        console.log("error")

      })

      this.isMaskGenerated = true;
      this.textButton = 'Inpaint';


    } else if (this.textButton == 'Inpaint') {

      if (this.objectImageSelected) {
        var imageStream = ''
        var imageStreamObject = ''

        if (this.coverImgFile) {
          this.convertToDataURL(this.coverImgFile).then((dataUrl) => {
            imageStream = dataUrl;

            this.convertToDataURL(this.objectImage!).then((dataUrlObject) => {
              imageStreamObject = dataUrlObject

              const imageInpaintModel: ImageInpaintModel = {
                inputImage: this.lamaImage,
                inputImageObject: imageStreamObject,
                maskObject: this.maskObject,
                maskBackground: this.maskBackground,
                prompt: this.textInpaintForm.value.promptText,
                strength: this.strengthValue,

              }
              this.inpaintBackService.setInputImage(imageStream)
              this.inpaintBackService.setPromptInpaint(this.textInpaintForm.value.promptText)
              this.inpaintBackService.setObjectImage(imageStreamObject)
              this.inpaintBackService.setIsPublic(this.isChecked)
              // console.log(imageStream)
              console.log("VERIFY STRENGTH")
              console.log(imageInpaintModel)



              this.loading = true

              this.inpaintService.getImageInpaint(imageInpaintModel).pipe().subscribe(response => {
                this.loading = false
                // console.log(response as string)

                let inpaintedImages = response.image
                inpaintedImages = inpaintedImages.map((image: any) => { image = "data:image/jpeg;base64," + image; return image })

                // const imageUrl = "data:image/jpeg;base64," + response.image
                // console.log(imageUrl)
                // this.generatedImage = imageUrl
                this.generatedImage = inpaintedImages
                this.isImageGenerated = true
                this.imageSelected = false
                this.fromGenerate = false;


                this.inpaintBackService.setResultImage(inpaintedImages[0])
                this.inpaintBackService.setIsPublic(this.isChecked)


              }, error => {
                console.log("error")

              })

            }).catch((error) => {
              console.error(error);
            });
          }).catch((error) => {
            console.error(error);
          });
        }

      } else {

        console.log("A INTRAT BINE")
        var imageStream = ''

        if (this.coverImgFile) {
          this.convertToDataURL(this.coverImgFile).then((dataUrl) => {
            imageStream = dataUrl;


            const textInapaintModel: TextInpaintModel = {
              image: imageStream,
              mask: this.maskObject,
              prompt: this.textInpaintForm.value.promptText,
              strength: this.strengthValue,
              isSDXLModel: this.isSdxlSelected
            }
            // console.log(imageStream)
            // console.log(this.maskObject)


            this.inpaintBackService.setPromptInpaint(this.textInpaintForm.value.promptText)
            this.inpaintBackService.setInputImage(imageStream)
            this.inpaintBackService.setIsPublic(this.isChecked)



            this.loading = true

            this.inpaintService.getTextInapint(textInapaintModel).pipe().subscribe(response => {
              this.loading = false
              // console.log(response as string)

              let inpaintedImages = response.image
              inpaintedImages = inpaintedImages.map((image: any) => { image = "data:image/jpeg;base64," + image; return image })

              this.inpaintBackService.setResultImage(inpaintedImages[0])

              // const imageUrl = "data:image/jpeg;base64," + response.image
              // console.log(imageUrl)
              // this.generatedImage = imageUrl
              this.generatedImage = inpaintedImages
              this.isImageGenerated = true
              this.imageSelected = false
              this.fromGenerate = false;


            }, error => {
              console.log("error")

            })

          }).catch((error) => {
            console.error(error);
          });
        }



      }
    }
  }

  private convertToDataURL(file: File): Promise<string> {
    return new Promise((convert) => {
      const reader = new FileReader();
      reader.onload = () => {
        convert(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }


  handleRenegerateMaskButtonClick(data: any) {

    if (this.highlightedImage) {

      if (document.getElementById("droppedObj")) {
        document.getElementById("droppedObj")!.style.visibility = "hidden";
        document.getElementById("droppedObj")!.style.animation = "";
      }
      if (document.getElementById("mask")) {
        document.getElementById("mask")!.style.visibility = "hidden";
      }

      this.isMaskGenerated = false;
      this.isUploadeButtonPressed = true;

      this.imageSelected = true;
      this.showImg = data
      this.textButton = 'Generate Mask';

      this.isCollapsedMask = false;
      this.madeMasksBool = false;
      this.isCollapsedObj = false;

    }


  }

  handleHighlightedImage(data: any) {


    this.highlightedImage = data;


    let objectMask: any;
    let backgroundMask: any;
    if (this.highlightedImage) { this.drawMasks(this.highlightedImage) }
  }

  // Image Generared
  handleClickedgeneratedImage(image: any) {
    this.isUploadeButtonPressed = true;
    this.textButton = 'Generate Mask';
    this.showImg = image
    this.imageSelected = true;
    this.isImageGenerated = false;
    // console.log(image)
  }

  drawMasks(highlightedImage: any) {

    var canvasObject = document.createElement('canvas');
    var canvasBackground = document.createElement('canvas');
    canvasObject.width = 600
    canvasObject.height = 600
    canvasBackground.width = 600
    canvasBackground.height = 600
    var ctxObject = canvasObject?.getContext("2d");
    var ctxBackground = canvasBackground?.getContext("2d");



    const img = new Image();
    img.src = highlightedImage;
    img.width = 600
    img.height = 600

    img.onload = () => {
      ctxObject?.drawImage(img, 0, 0, 600, 600);
      ctxBackground?.drawImage(img, 0, 0, 600, 600);


      var colorObject = 0
      var colorBackground = 255;
      let self = this;
      if (ctxObject && ctxBackground) {
        const imageDataObject = ctxObject.getImageData(0, 0, 600, 600);
        const imageDataBackground = ctxBackground.getImageData(0, 0, 600, 600);

        for (let i = 0; i < imageDataObject.data.length; i += 4) {

          let count = imageDataObject.data[i] + imageDataObject.data[i + 1] + imageDataObject.data[i + 2];

          colorBackground = 255
          colorObject = 0

          if (count > 255) {
            colorBackground = 0;
            colorObject = 255;
          }



          imageDataBackground.data[i] = colorBackground;
          imageDataBackground.data[i + 1] = colorBackground;
          imageDataBackground.data[i + 2] = colorBackground;
          imageDataBackground.data[i + 3] = 255;

          imageDataObject.data[i] = colorObject;
          imageDataObject.data[i + 1] = colorObject;
          imageDataObject.data[i + 2] = colorObject;
          imageDataObject.data[i + 3] = 255;


        }
        ctxObject.putImageData(imageDataObject, 0, 0)
        ctxBackground.putImageData(imageDataBackground, 0, 0)

        this.maskObject = ctxObject?.canvas.toDataURL()
        this.maskBackground = ctxBackground?.canvas.toDataURL()
        this.madeMasksBool = true
      }
    };





  }


  selectSdxlModel() {
    this.isSdSelected = false;
    this.isSdxlSelected = true;
  }


  selectSdModel() {
    this.isSdSelected = true;
    this.isSdxlSelected = false;
  }

  onRemoveImageClick() {

    this.objectImageSelected = false;
    this.showObjImg = null;
    this.show = false;

  }

  // Tooltips
  tooltipTextPrompt = "Enter a description to guide the AI in creating your image."
  tooltipStrength = "How strictly the model will stick to the prompt. "
  tooltipModel = "Select from different AI models to influence the inpainting style."
  tooltipPublic = "Share you creation with others. "

  hover: boolean = false;
  hoverModel: boolean = false;
  hoverStrength: boolean = false;
  hoverPublic: boolean = false;


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

  showTextModel() {
    this.hoverModel = true;
  }
  hideTextModel() {
    this.hoverModel = false;
  }
  showTextPublic() {
    this.hoverPublic = true;
  }
  hideTextPublic() {
    this.hoverPublic = false;
  }

}

