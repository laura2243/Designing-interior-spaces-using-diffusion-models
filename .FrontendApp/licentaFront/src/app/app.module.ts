import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HighlightObjectPaneComponent } from './components/highlight-object-pane/highlight-object-pane.component';
import { GenerateImagePageComponent } from './components/generate-image-page/generate-image-page.component';
import { PromptAssistantComponent } from './components/prompt-assistant/prompt-assistant.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { NavigationBarComponent } from './components/navigation-bar/navigation-bar.component';
import { MyCreationsComponent } from './components/my-creations/my-creations.component';
import { RemovedObjectPaneComponent } from './components/removed-object-pane/removed-object-pane.component';
import { ImageDetailsComponent } from './components/image-details/image-details.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfoTooltipComponent } from './components/info-tooltip/info-tooltip.component';
import { HttpClientModule } from '@angular/common/http';
import { ResultPaneComponent } from './components/result-pane/result-pane.component';
import { RegisterComponent } from './components/register/register.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';
import { InfoMessagesComponent } from './components/info-messages/info-messages.component';
import { GalleryComponent } from './components/gallery/gallery.component';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HighlightObjectPaneComponent,
    GenerateImagePageComponent,
    PromptAssistantComponent,
    HomePageComponent,
    NavigationBarComponent,
    MyCreationsComponent,
    RemovedObjectPaneComponent,
    ImageDetailsComponent,
    LoginComponent,
    InfoTooltipComponent,
    ResultPaneComponent,
    RegisterComponent,
    TooltipComponent,
    InfoMessagesComponent,
    GalleryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
