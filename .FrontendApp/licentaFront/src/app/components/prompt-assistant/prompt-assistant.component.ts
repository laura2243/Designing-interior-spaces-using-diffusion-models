import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, EventEmitter, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { PromptAssistantService } from 'src/app/services/prompAssistant.service';

@Component({
  selector: 'app-prompt-assistant',
  templateUrl: './prompt-assistant.component.html',
  styleUrls: ['./prompt-assistant.component.css'],
  animations: [
    trigger("msgAnimation", [
      state('void', style(
        {
          opacity: 0,
          transform: "translate(0px,20px)"
        }
      ))
      ,
      transition(':enter', [
        animate('.3s ease-out', style({
          opacity: 1,
          transform: "translate(0px,0px)"
        }))
      ]),
      transition(':leave', [
        animate('.3s ease-in', style({
          opacity: 0,
          transform: "translate(0px,20px)"
        }))
      ]),


    ])
  ]
})
export class PromptAssistantComponent implements OnInit {



  @Output() dataEvent = new EventEmitter<any>();
  isSidebarOpen: boolean = true;
  loading: boolean = false;

  constructor(private promptAssistantService: PromptAssistantService, private renderer: Renderer2) { }

  ngOnInit(): void {


  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  scroll() {
    setTimeout(() => document.getElementById("conversationContainer")!.scrollTop = document.getElementById("conversationContainer")!.scrollHeight
    )
  }

  addNewChat() {
    this.ngOnInit()
    this.messagesList = []
    
  }

  onUsePromptClick() {

    if (this.lastPromptMessage != '' && this.lastPromptMessage != null && this.lastPromptMessage != undefined) {
      this.dataEvent.emit(this.lastPromptMessage)
    }
  }

  messagesList: string[] = [];
  lastPromptMessage: string = '';
  sendMessageToPromptAssistant(message: string, input: HTMLInputElement) {

    if (message != null && message != undefined && message != "") {
      input.value = '';
      this.messagesList.push(message)
      this.scroll()
      this.loading = true;

      console.log(message)
      if (message != null && message != undefined && message != "") {
        this.promptAssistantService.sendMessageToPromptAssistant(message).pipe().subscribe(reply => {
          this.loading = false;
          this.lastPromptMessage = reply
          this.messagesList.push(reply)
          this.scroll()
        }, error => {
          console.log("error")

        })
      }
    }
  }
}
