import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { BrowserModule } from '@angular/platform-browser';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { appReducers } from './store/reducers/app.reducers';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { ConfigEffects } from './store/effects/config.effects';
import { EntityEffects } from './store/effects/entity.effects';
import { AppComponent } from './app.component';
import { EntityService } from './services/entity.service';
import { EntitiesComponent as EntitiesContainerComponent } from './containers/entities/entities.component';
import { EntitiesComponent } from './components/entities/entities.component';
import { EntityComponent } from './containers/entity/entity.component';
import { EntityDetailsComponent } from './components/entity-details/entity-details.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './services/error.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    EntitiesContainerComponent,
    EntitiesComponent,
    EntityComponent,
    EntityDetailsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    StoreModule.forRoot(appReducers),
    EffectsModule.forRoot([EntityEffects, ConfigEffects]),
    StoreRouterConnectingModule.forRoot({ stateKey: 'router' }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    AppRoutingModule
  ],
  providers: [EntityService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
	],
  bootstrap: [AppComponent]
})
export class AppModule {}
