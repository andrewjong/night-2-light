import {WebcamModule} from 'ngx-webcam';
import {ImageEditorComponent} from './image-editor/image-editor.component';
import {NgxElectronModule} from 'ngx-electron';
import {AppComponent} from "./app.component";
import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AppRoutingModule} from "./app-routing-module";
import {ButtonModule, ConfirmDialogModule, FileUploadModule, SplitButtonModule, ToolbarModule} from "primeng/primeng";
import {RouterModule} from "@angular/router";
import {ngxLoadingAnimationTypes, NgxLoadingModule} from "ngx-loading";
import { HttpClient, HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    ImageEditorComponent,
  ],
  imports: [
    NgxLoadingModule.forRoot({
      animationType: ngxLoadingAnimationTypes.circleSwish,
      fullScreenBackdrop: true,
      backdropBackgroundColour: 'rgba(0,0,0,0.1)',
      backdropBorderRadius: '4px',
      primaryColour: '#ffffff',
      secondaryColour: '#ffffff',
      tertiaryColour: '#ffffff'
    }),
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FileUploadModule,
    ButtonModule,
    ToolbarModule,
    SplitButtonModule,
    WebcamModule,
    NgxElectronModule,
    ConfirmDialogModule,
    HttpClientModule
  ],
  exports: [RouterModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
