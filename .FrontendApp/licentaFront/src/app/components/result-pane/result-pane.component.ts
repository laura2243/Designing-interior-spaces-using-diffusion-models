import { Component, ElementRef, EventEmitter, Input, Output, Renderer2 } from '@angular/core';
import { Route, Router } from '@angular/router';
import { InpaintBackService } from 'src/app/services/inpaintBack.service';

@Component({
  selector: 'app-result-pane',
  templateUrl: './result-pane.component.html',
  styleUrls: ['./result-pane.component.css']
})
export class ResultPaneComponent {



  oneImage: boolean = false;
  twoImages: boolean = false;
  threeImages: boolean = false;
  fourImages: boolean = false;
  singleImage: boolean = false;
  selectedImageElement: any;
  lastSelectedImageElement: any;
  mockImages: any[] = ["../../../assets/chat2.png", "../../../assets/chat.jpg"]

  constructor(private renderer: Renderer2, private elementRef: ElementRef, private router: Router,private inpaintBackService: InpaintBackService) { }
  ngOnInit(): void {
    // console.log(this.generatedImages)

    if(!this.fromGenerate){
      console.log("SEE OBJECT FOR BACK")
      this.inpaintBackService.saveResultObject()
    }
  }


  @Input() generatedImages!: any[];
  @Input() fromGenerate!: boolean;
  @Output() dataEvent = new EventEmitter<any>();



  getImageClass(): string {

    if (this.mockImages.length == 1) {
      this.singleImage = true;
      return "imageElementOne"
    }
    if (this.mockImages.length == 2) {
      return "imageElementTwo";
    }
    if (this.mockImages.length == 3) {
      return "imageElementThree"
    }
    if (this.mockImages.length == 4) {
      return "imageElementFour"
    }

    return "imageElementOne"
  }

  clickedImage(event: MouseEvent, image: any) {

    this.selectedImageElement = image


    this.addBorder(event.target as HTMLElement);

    // img = clickedImage.createObjectURL(this.selectedImageElement)
  }

  addBorder(imageElement: HTMLElement) {

    // console.log(this.lastSelectedImageElement)
    if (this.lastSelectedImageElement != undefined) {
      this.renderer.setStyle(this.lastSelectedImageElement, 'border', null);

    }
    this.lastSelectedImageElement = imageElement

    this.renderer.setStyle(imageElement, 'border', '3px solid #5858e6');
  }

  inpaintImage(clickedImage: any) {
    // console.log(this.selectedImageElement)

    if (this.singleImage == true || this.selectedImageElement != undefined) {
      // console.log(this.selectedImageElement)

      this.inpaintBackService.setInputImage(this.selectedImageElement)
      this.dataEvent.emit(this.selectedImageElement)
    }

  }

  regenerateButton() {
    window.location.reload()
    this.router.navigate(['/generate'], { queryParams: { reloadPage: true } })
  }

  reinpaintButton() {
    console.log("am apasat")
    this.router.navigate(['/home'], { queryParams: { reinpaint: true } })
  }

  continueInpaintButton() {
    if (this.singleImage == true || this.selectedImageElement != undefined) {
      this.router.navigate(['/home'], { queryParams: { continueInpaint: true, continueInpaintImage: this.selectedImageElement } })
    }
  }


}

