import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ImageInpaintModelResult } from 'src/app/models/ImageInpaintModelResult';
import { ResultImagesModel } from 'src/app/models/ResultImagesModel';
import { InpaintBackService } from 'src/app/services/inpaintBack.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent {



  allImagesBeforeConversion!: any[];
  images!: ResultImagesModel[];
  allImages!: ImageInpaintModelResult[];


  constructor(private router: Router, private inpaintBackService: InpaintBackService) { }




  ngOnInit() {

    this.inpaintBackService.getGalleryImages(
    ).pipe().subscribe(data => {
      this.images = data

      this.allImagesBeforeConversion = data
      this.allImages = data.map((image: any) => this.convertAtributes(image))

      console.log(this.allImages.length)


      for (let image of this.allImages) {



        if (image.promptGeneration == undefined || image.promptGeneration == null || image.promptGeneration == "") {
          image.isGenerated = false;
        } else {
          image.isGenerated = true;
        }

        if (image.objectImage == undefined || image.objectImage == null || image.objectImage == "data:image/jpeg;base64,null" || image.objectImage == "data:image/jpeg;base64,<null>" || image.objectImage == "data:image/jpeg;base64,") {
          image.isImageInpaint = false;
        } else {
          image.isImageInpaint = true;
        }


      }

    })


    this.allImages = this.all




  }

  all: ImageInpaintModelResult[] = [];


  convertAtributes(image: any): ImageInpaintModelResult {
    let imageInpaintModelResult: ImageInpaintModelResult = {
      isPublic: image.isPublic,
      userId: image.user_id,
      inputImage: 'data:image/jpeg;base64,' + image.input_image,
      objectImage: 'data:image/jpeg;base64,' + image.object_image,
      maskObject: 'data:image/jpeg;base64,' + image.mask_object,
      maskBackground: 'data:image/jpeg;base64,' + image.mask_background,
      promptInpaint: image.prompt_inpaint,
      promptGeneration: image.prompt_generation,
      resultImage: 'data:image/jpeg;base64,' + image.result_image,
    };

    this.all.push(imageInpaintModelResult)

    console.log(this.all)

    return imageInpaintModelResult;
  }

  clickOnImage(image: ImageInpaintModelResult) {
    console.log(image.maskBackground)
    this.router.navigate(['/image-details'], { state: { data: image, fromGallery: true } })
  }


  tooltip = "Welcome to the Gallery feed! "

  hover: boolean = false;

  showText() {
    this.hover = true;
  }
  hideText() {
    this.hover = false;
  }


}
