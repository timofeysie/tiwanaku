import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { IEntityHttp } from '../models/http-models/entity-http.interface';

@Injectable()
export class EntityService {
  entitiesUrl = `${environment.apiUrl}entities.json`;
  private backendListUrl = 'https://radiant-springs-38893.herokuapp.com/api/list';

  constructor(private _http: HttpClient) { }

  getEntities(): Observable<IEntityHttp> {
    return this._http.get<IEntityHttp>(this.entitiesUrl);
  }

  getList(): Observable<IEntityHttp> {
    return this._http.get<IEntityHttp>(this.backendListUrl + '/en');
  }

}
