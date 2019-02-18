import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { StoreModule } from "@ngrx/store";
import { metaReducer } from "./common/index";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    StoreModule.forRoot({ reducer: metaReducer })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
