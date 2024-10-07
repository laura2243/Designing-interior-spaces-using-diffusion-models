import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ImageInpaintModelResult } from 'src/app/models/ImageInpaintModelResult';

@Component({
  selector: 'app-image-details',
  templateUrl: './image-details.component.html',
  styleUrls: ['./image-details.component.css']
})
export class ImageDetailsComponent {


  carouselObject!: ImageInpaintModelResult;
  imageNumber: number = 0;
  private debounceTimeout: any;
  fromGallery: boolean = false;


  constructor(private router: Router, private http: HttpClient) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { data: any };
    const whereFrom = navigation?.extras.state as { fromGallery: any };
    this.carouselObject = state?.data;
    this.fromGallery = whereFrom?.fromGallery;

    console.log(this.carouselObject)
  }
  ngOnInit(): void {

    console.log(this.carouselObject)

  }

  nextImageClick() {
    if (this.carouselObject.isImageInpaint == false && this.imageNumber == 2) {
      this.imageNumber = 0
    } else
      if (this.carouselObject.isImageInpaint == true && this.imageNumber == 4) {
        this.imageNumber = 0

      }
      else if (this.imageNumber < 5) { this.imageNumber = this.imageNumber + 1; }
  }
  previousImageClick() {

    if (this.carouselObject.isImageInpaint == false && this.imageNumber == 0) {
      this.imageNumber = 2
    } else
      if (this.carouselObject.isImageInpaint == true && this.imageNumber == 0) {
        this.imageNumber = 4
      } else
        if (this.imageNumber > 0) {
          this.imageNumber = this.imageNumber - 1;
        }


  }

  onBackClick() {
    if (this.fromGallery) {
      this.router.navigate(['/gallery'])
    }
    else { this.router.navigate(['/creations']) }
  }

  downloadImage() {

    let toDownloadImage: any;
    let toDownloadImageName: string;

    if (this.imageNumber == 0) {
      toDownloadImage = this.carouselObject.resultImage
      toDownloadImageName = "FinalInpaintingResult"
    }
    if (this.imageNumber == 1) {
      toDownloadImage = this.carouselObject.inputImage
      toDownloadImageName = "Input Image"
    }
    if (this.imageNumber == 2) {
      toDownloadImage = this.carouselObject.maskObject
      toDownloadImageName = "ReplacedObjectMask"
    }
    if (this.imageNumber == 3) {
      toDownloadImage = this.carouselObject.maskBackground
      toDownloadImageName = "BackgroundImageMask"
    }
    if (this.imageNumber == 4) {
      toDownloadImage = this.carouselObject.objectImage
      toDownloadImageName = "InpaintedObjectImage"
    }


    this.http.get(toDownloadImage, { responseType: 'blob' }).subscribe(blob => {
      var toDownload = document.createElement('a');
      toDownload.href = URL.createObjectURL(blob);
      toDownload.download = toDownloadImageName + '.jpg';
      document.body.appendChild(toDownload);
      toDownload.click();
      document.body.removeChild(toDownload);
    }, error => {
      console.error('Error downloading the image: ', error);
    });
  }

}
