import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-messages',
  templateUrl: './info-messages.component.html',
  styleUrls: ['./info-messages.component.css']
})
export class InfoMessagesComponent implements OnInit {

  @Input() message!: string;
  @Input() success!: boolean;

  ngOnInit(): void {
      console.log(this.message);
      console.log(this.success);
  }
}
