import {NgModule} from "@angular/core";
import {PreloadAllModules, RouterModule, Routes} from "@angular/router";
import { HomeComponent } from './home/home.component';
import { ImageEditorComponent } from "./image-editor/image-editor.component";
import {AppComponent} from "./app.component";




const appRoutes: Routes = [
  {path: '' , component: ImageEditorComponent},
  {path: 'ImageEditor' , component: HomeComponent}
    // canActivate: [AuthGuard]},
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
