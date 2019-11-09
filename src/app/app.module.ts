import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material';
import { MatSelectModule } from '@angular/material';
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
import { ThemeService } from './services/theme.service';
import { OptionsComponent } from './containers/options/options.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormComponent } from './form/form.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { CheckForUpdateService } from './services/check-for-update.service';
import { LogUpdateService } from './services/log-update.service';
import { PromptUpdateService } from './services/prompt-update.service';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    EntitiesContainerComponent,
    EntitiesComponent,
    EntityComponent,
    EntityDetailsComponent,
    OptionsComponent,
    FormComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpClientModule,
    StoreModule.forRoot(appReducers),
    EffectsModule.forRoot([EntityEffects, ConfigEffects]),
    StoreRouterConnectingModule.forRoot({ stateKey: 'router' }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    RouterModule
  ],
  providers: [
    EntityService,
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ThemeService,
    CheckForUpdateService,
    LogUpdateService,
    PromptUpdateService,
    ],
  bootstrap: [AppComponent]
})
export class AppModule {}
