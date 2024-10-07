import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-removed-object-pane',
  templateUrl: './removed-object-pane.component.html',
  styleUrls: ['./removed-object-pane.component.css']
})
export class RemovedObjectPaneComponent implements OnInit {

  ngOnInit(): void {


  }


  @Input() selectedImage: any;
  @Input() highlightedImage: any;
  @Input() maskObject: any;
  @Input() maskBackground: any;
  @Input() lamaImage: any;
  @Output() dataEvent = new EventEmitter<any>();
  @Output() selectedImageOutput = new EventEmitter<any>();
  isActive: boolean = false;


  toggleSlider() {
    this.isActive = !this.isActive;


    var canvas = document.createElement('canvas');
    canvas.width = 600
    canvas.height = 600
    var imageElement = document.getElementById('imageElement') as HTMLImageElement;
    var ctx = canvas?.getContext("2d");
    ctx?.drawImage(imageElement, 0, 0);

    // console.log(ctx?.canvas.toDataURL())


    var color = 255;
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, 600, 600);

      for (let i = 0; i < imageData.data.length; i += 4) {

        color = 0
        let rgbValue = imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2];
        if (rgbValue > 255) color = 255;

        imageData.data[i] = color;
        imageData.data[i + 1] = color;
        imageData.data[i + 2] = color;
        imageData.data[i + 3] = 255;

      }
      ctx.putImageData(imageData, 0, 0)
      console.log(ctx.canvas.toDataURL())
    }




  }

  onButtonClick() {
    this.dataEvent.emit(this.selectedImage);

  }



}
