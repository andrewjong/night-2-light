import {NgModule} from "@angular/core";
import {PreloadAllModules, RouterModule, Routes} from "@angular/router";
import { ImageEditorComponent } from "./image-editor/image-editor.component";
import {AppComponent} from "./app.component";




const appRoutes: Routes = [
  {path: '' , component: ImageEditorComponent}
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
