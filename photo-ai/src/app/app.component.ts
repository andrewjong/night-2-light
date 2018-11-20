import {Component, OnInit} from '@angular/core';
import {ElectronService} from "ngx-electron";


@Component({
  selector: 'app-root',
  template: `
    <div class="container" align="center">
      <router-outlet></router-outlet>
    </div>    `
})
export class AppComponent implements OnInit{

  constructor(private _electronService: ElectronService){}

  public playPingPong() {
  }

  ngOnInit(): void {
    console.log("Result of isElectronApp is: " +this._electronService.isElectronApp)

  }

}
