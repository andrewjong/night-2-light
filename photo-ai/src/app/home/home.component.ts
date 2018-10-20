import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Observable, Subject} from "rxjs";
import {WebcamImage} from "ngx-webcam";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  url: string = '';
  showWebcam: boolean = false;
  private trigger: Subject<void> = new Subject<void>();
  @ViewChild('fileInput') fileInput: ElementRef;

  constructor() { }
  ngOnInit() {}

  onSelectFile(event) { // called each time file input changes
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event : Event) => { // called once readAsDataURL is completed
        if (typeof reader.result === "string") {
          this.url = reader.result
        }
      }
      this.fileInput.nativeElement.value = ''
    }
  }

  toggleWebcam() {
    this.showWebcam = !this.showWebcam
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public triggerSnapshot(): void {
    this.trigger.next();
    this.showWebcam = !this.showWebcam;
  }
  public handleImage(webcamImage: WebcamImage): void {
    this.url = webcamImage.imageAsDataUrl
  }
}
