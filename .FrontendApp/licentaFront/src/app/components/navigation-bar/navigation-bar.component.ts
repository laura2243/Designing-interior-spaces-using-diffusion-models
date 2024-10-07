import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InpaintService } from 'src/app/services/inpaint.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})
export class NavigationBarComponent implements OnInit {

  activeElement: string | null = null;
  isLoggedIn: boolean = false;

  constructor(public router: Router, private inpaintService: InpaintService) { }

  ngOnInit() {
    const currentUserString = sessionStorage.getItem('currentUser');
    if (currentUserString) {
      const currentUser = JSON.parse(currentUserString)
      this.isLoggedIn = true;
    }
  }

  setActive(elementId: string) {
    
    this.activeElement = elementId;
  
  }

  isActive(elementId: string): boolean {

 
    return this.activeElement == elementId;

  }

  logOut() {
    localStorage.removeItem('accessToken');
    sessionStorage.clear();
    localStorage.clear();


    this.router.navigate(['/login']);
  }


  click() {
    console.log("click")
    
  }

}
