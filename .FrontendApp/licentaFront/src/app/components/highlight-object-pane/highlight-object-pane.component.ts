import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-highlight-object-pane',
  templateUrl: './highlight-object-pane.component.html',
  styleUrls: ['./highlight-object-pane.component.css']
})
export class HighlightObjectPaneComponent implements OnInit {


  @ViewChild('imageElement') img!: ElementRef<HTMLImageElement>;
  @Input() inputImage!: any;

  @Output() dataEvent = new EventEmitter<any>();


  imageElement!: HTMLImageElement;
  highlightCanvas: HTMLCanvasElement | null = null;
  context: CanvasRenderingContext2D | null = null;
  isDrawing = false;
  brushSize: number = 5;
  ctxCopy: any;

  ngOnInit(): void {


    const highlightedImage = undefined;
    this.dataEvent.emit(highlightedImage)

    const slider = document.getElementById('lineBrush') as HTMLInputElement;
    const sliderValue = document.getElementById('sliderValueBrush') as HTMLInputElement;

    sliderValue.value = slider.value
    this.brushSize = parseInt(sliderValue.value)

    this.updateBackground(slider, parseFloat(slider.min), parseFloat(slider.value));

    this.imageElement = document.getElementById('imageElement') as HTMLImageElement;
    this.highlightCanvas = document.getElementById('canvas') as HTMLCanvasElement;


    this.highlightCanvas.width = 600
    this.highlightCanvas.height = 600

    if (this.highlightCanvas) {

      this.context = this.highlightCanvas.getContext('2d');
      this.context!.clearRect(0, 0, 600, 600);
      this.highlightCanvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
      this.highlightCanvas.addEventListener('mouseup', (event) => this.onMouseUp(event));
      this.highlightCanvas.addEventListener('mousemove', (event) => this.onMouseMove(event));


    }


    const canvasCopy = document.createElement('canvas');



    const img = new Image();
    img.onload = () => {



      canvasCopy.width = 600;
      canvasCopy.height = 600;
      // console.log(canvasCopy.height, canvasCopy.width);


      this.ctxCopy = canvasCopy.getContext('2d')
      this.ctxCopy?.drawImage(img, 600, 600)


    };
    img.src = this.inputImage;

  }

  onSliderChange(event: Event) {
    const slider = event.target as HTMLInputElement;
    const sliderValue = document.getElementById('sliderValueBrush') as HTMLInputElement;
    sliderValue.value = slider.value
    this.brushSize = parseInt(sliderValue.value)
    this.updateBackground(slider, parseFloat(slider.min), parseFloat(slider.value));
  }

  updateBackground(slider: HTMLInputElement, minValue: number, value: number) {
    slider.style.background = `linear-gradient(to right, black 0%, gray ${(value - minValue) / (parseFloat(slider.max) - minValue) * 100 - 1}%, #DEE2E6 ${(value - minValue) / (parseFloat(slider.max) - minValue) * 100}%, #DEE2E6 100%)`;
  }


  onMouseMove(event: MouseEvent) {

    const customCursor = document.createElement('canvas');
    const contextCustomCursor = customCursor.getContext('2d');

    customCursor.width = 100;
    customCursor.height = 100;


    contextCustomCursor!.fillStyle = "rgb(115, 115, 234)";
    contextCustomCursor?.arc(50, 50, this.brushSize - 4, 0, 2 * Math.PI);
    contextCustomCursor?.fill()
    this.context!.canvas.style.cursor = `url(${customCursor.toDataURL()}) ${50} ${50}, auto`

    if (!this.isDrawing) return;
    var [x, y] = this.calculateMousePosition(event.clientX, event.clientY)
    this.drawHighlight(x, y);

  }

  onMouseDown(event: MouseEvent) {

    var [x, y] = this.calculateMousePosition(event.clientX, event.clientY)
    this.isDrawing = true;
    this.drawHighlight(x, y);

  }
  onMouseUp(event: MouseEvent) {
    this.isDrawing = false;


    const highlightedImageUrl = this.ctxCopy.canvas.toDataURL();

    const highlightedImage = this.highlightCanvas?.toDataURL()
    // console.log(highlightedImageUrl)
    // console.log(this.highlightCanvas?.toDataURL())
    this.dataEvent.emit(highlightedImage)

  }

  onClick(event: MouseEvent) {

    var [x, y] = this.calculateMousePosition(event.clientX, event.clientY)
    this.drawHighlight(x, y);
  }

  calculateMousePosition(coordX: number, coordY: number): number[] {

    const rect = this.highlightCanvas!.getBoundingClientRect();
    const scaleX = this.highlightCanvas!.width / rect.width;
    const scaleY = this.highlightCanvas!.height / rect.height;
    const x = (coordX - rect.left) * scaleX
    const y = (coordY - rect.top) * scaleY

    return [x, y];
  }

  drawHighlight(x: number, y: number) {

    const aspectRatio = this.highlightCanvas!.width / this.highlightCanvas!.height;
    const radiusY = this.brushSize / (this.highlightCanvas!.width / this.highlightCanvas!.height);



    if (!this.context) return;


    this.context.fillStyle = "rgb(115, 115, 234)"
    this.ctxCopy.fillStyle = "rgba(172,38,255)"

    this.ctxCopy.beginPath();
    this.ctxCopy.ellipse(x, y, this.brushSize, radiusY, 0, 0, 2 * Math.PI);
    this.ctxCopy.fill();

    this.context.beginPath();
    this.context.ellipse(x, y, this.brushSize, radiusY, 0, 0, 2 * Math.PI);
    this.context.fill();


  }

  onEraseClick() {
    const highlightedImage = undefined;
    this.dataEvent.emit(highlightedImage)
    this.ngOnInit()
  }





}
