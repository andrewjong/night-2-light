import {NgModule} from "@angular/core";
import {PreloadAllModules, RouterModule, Routes} from "@angular/router";
import {MyNavbarComponent} from "./my-navbar/my-navbar.component";
import {MyDashboardComponent} from "./my-dashboard/my-dashboard.component";
import {MyTableComponent} from "./my-table/my-table.component";


const appRoutes: Routes = [
  {path: 'nav', component: MyNavbarComponent},
  {path: 'dashboard', component: MyDashboardComponent},
  {path: 'table', component: MyTableComponent}
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
