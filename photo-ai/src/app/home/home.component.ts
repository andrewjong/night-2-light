import { Component, OnInit } from '@angular/core';
import {Observable, Subject} from "rxjs";
import {WebcamImage} from "ngx-webcam";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})


export class HomeComponent implements OnInit {  
  touchstartX:number = 0;
  touchendX:number = 0;
  gestureZone: any;

  
  constructor() { 
    // this.gestureZone = document.getElementById('swipe-area');
    // this.gestureZone.addEventListener('touchstart', function(event){
    //   this.touchstartX = event.changedTouches[0].screenX;
    // },false);
    // this.gestureZone.addEventListener('touchend', function(event) {
    //   this.touchendX = event.changedTouches[0].screenX;
    //   this.handleGesture();
    // }, false); 
  }

  ngOnInit() {}

  /**
   * This will
   */
  private handleGesture(): void {
    if (this.touchendX <= this.touchstartX) {
      console.log('Swiped left');
  }
  
  if (this.touchendX >= this.touchstartX) {
      console.log('Swiped right');
  }

  }
}
