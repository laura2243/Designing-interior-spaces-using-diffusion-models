import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GenerateImageModel } from 'src/app/models/GenerateImageModel';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {


  allImages: any[] = [];
  ngOnInit() {

    this.allImages = [
      'assets/images/1.png',
      'assets/images/2.png',
      'assets/images/3.png',
      'assets/images/4.png',
      'assets/images/5.jpg',
      'assets/images/inter4.jpg',
      'assets/images/6.jpg',
      'assets/images/7.jpg',
      'assets/images/8.jpg',
      'assets/images/inter2.jpg',
      'assets/images/9.jpg',
      'assets/images/inter3.jpg',
      'assets/images/14.jpg',
      'assets/images/inter.jpg',
      'assets/images/11.jpg',
      'assets/images/10.jpg',
    ]
  }

}
