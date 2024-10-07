import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GenerateImagePageComponent } from './components/generate-image-page/generate-image-page.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { MyCreationsComponent } from './components/my-creations/my-creations.component';
import { ImageDetailsComponent } from './components/image-details/image-details.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { InfoMessagesComponent } from './components/info-messages/info-messages.component';
import { GalleryComponent } from './components/gallery/gallery.component';

const routes: Routes = [
  {path: 'image-details', component: ImageDetailsComponent},
  {path: 'home', component: DashboardComponent},
  {path: 'generate', component: GenerateImagePageComponent},
  {path: 'creations', component: MyCreationsComponent},
  {path: 'gallery', component: GalleryComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: '', component: HomePageComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
