import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IEntityHttp } from '../models/http-models/entity-http.interface';
import { Store, select } from '@ngrx/store';
import { IAppState } from '../store/state/app.state';
import { GetConfig } from '../store/actions/config.actions';
import { selectConfig } from '../store/selectors/config.selector';

@Injectable()
export class EntityService implements OnInit {
  lang: string;
  config$ = this._store.pipe(select(selectConfig));
  entitiesUrl = `${environment.apiUrl}entities.json`;
  private backendListUrl = 'https://radiant-springs-38893.herokuapp.com/api/list';


  constructor(private _http: HttpClient,
    private _store: Store<IAppState>) {
      this.config$.subscribe(config => {
          if (typeof config !== 'undefined' && config !== null) {
            if (typeof config.language !== 'undefined') {
              this.lang = '/'+config.language;
            }
          }
      });
  }

  ngOnInit() {
    // config$ is an 'Observable<IConfig>'
    this.config$.subscribe(x => {
      if (x.language) {
        console.log(x)
      }
    });
  }


  getEntities(): Observable<IEntityHttp> {
    return this._http.get<IEntityHttp>(this.entitiesUrl);
  }

  getList(): Observable<IEntityHttp> {
    if (!this.lang) {
      this.lang = '/en';
    }
    return this._http.get<IEntityHttp>(this.backendListUrl + this.lang);
  }

}
