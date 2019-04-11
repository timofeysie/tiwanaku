import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IEntityHttp } from '../models/http-models/entity-http.interface';
import { Store, select } from '@ngrx/store';
import { IAppState } from '../store/state/app.state';
import { GetConfig } from '../store/actions/config.actions';
import { selectConfig } from '../store/selectors/config.selector';
import { State } from '@ngrx/store';

@Injectable()
export class EntityService implements OnInit {
  stateObj;
  lang: string;
  config$ = this._store.pipe(select(selectConfig));
  entitiesUrl = `${environment.apiUrl}entities.json`;
  private backendListUrl = 'https://radiant-springs-38893.herokuapp.com/api/list';


  constructor(private _http: HttpClient,
    private _store: Store<IAppState>,
    private state: State<IAppState>) {
      this.stateObj = state;
      this.config$.subscribe(config => {
          if (typeof config !== 'undefined' && config !== null) {
            if (typeof config.language !== 'undefined') {
              this.lang = '/'+config.language;
            }
          }
      });
  }

  ngOnInit() {
    console.log('on init');
  }

  getEntities(): Observable<IEntityHttp> {
    return this._http.get<IEntityHttp>(this.entitiesUrl);
  }

  getList(): Observable<IEntityHttp> {
    let propertyValue = this.stateObj.getValue().config;
    console.log('propertyValue',propertyValue);
    if (!this.lang) {
      this.lang = '/en';
      console.log('used temp default')
    }
    return this._http.get<IEntityHttp>(this.backendListUrl + this.lang);
  }

}
