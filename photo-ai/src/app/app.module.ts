import {WebcamModule} from 'ngx-webcam';
import {ImageEditorComponent} from './image-editor/image-editor.component';
import {NgxElectronModule} from 'ngx-electron';
import {AppComponent} from "./app.component";
import {NgModule} from "@angular/core";
import {HomeComponent} from "./home/home.component";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AppRoutingModule} from "./app-routing-module";
import {ButtonModule, ConfirmDialogModule, FileUploadModule, SplitButtonModule, ToolbarModule} from "primeng/primeng";
import {RouterModule} from "@angular/router";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ImageEditorComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FileUploadModule,
    ButtonModule,
    ToolbarModule,
    SplitButtonModule,
    WebcamModule,
    NgxElectronModule,
    ConfirmDialogModule
  ],
  exports: [RouterModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
