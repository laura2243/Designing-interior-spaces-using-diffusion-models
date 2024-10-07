import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-tooltip',
  templateUrl: './info-tooltip.component.html',
  styleUrls: ['./info-tooltip.component.css']
})
export class InfoTooltipComponent {
  @Input() text: string = '';
  hover: boolean = false;

  showText() {
    this.hover = true;
  }

  hideText() {

    this.hover = false;
  }
}
