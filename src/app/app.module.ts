import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import {Routes, RouterModule} from '@angular/router';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
 {path : 'demo', loadChildren: './demo/demo.module#DemoModule' },
 {path : 'contactmanager', loadChildren: './contactmanager/contactmanager.module#ContactmanagerModule' },
 {path: '**', redirectTo: 'contactmanager'}
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
