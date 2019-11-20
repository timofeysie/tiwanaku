import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ICategoryHttp } from '../models/http-models/category-http.interface';
import { Store, select } from '@ngrx/store';
import { IAppState } from '../store/state/app.state';
import { selectConfig } from '../store/selectors/config.selector';
import { State } from '@ngrx/store';
import * as wdk from 'wikidata-sdk';

@Injectable()
export class CategoryService implements OnInit {
  stateObj;
  lang: string;
  config$ = this._store.pipe(select(selectConfig));
  categoriesUrl = `${environment.apiUrl}categories.json`;
  private backendListUrl = 'https://radiant-springs-38893.herokuapp.com/api/list';
  private strumosaUrl = 'http://strumosa.azurewebsites.net/items';


  constructor(private _http: HttpClient,
    private _store: Store<IAppState>,
    private state: State<IAppState>) {
      this.stateObj = state;
      this.config$.subscribe(config => {
          if (typeof config !== 'undefined' && config !== null) {
            if (typeof config.language !== 'undefined') {
              this.lang = '/' + config.language;
            }
          }
      });
  }

  ngOnInit() {
    console.log('on init');
  }

  getCategories(): Observable<ICategoryHttp> {
    return of<ICategoryHttp>({
        category: '1',
        language: '2',
        wdt: '3',
        wd: '4'
      });
  }

  // ?lang=en&category=fallacies&wdt=P31&wd=Q186150
  // http://strumosa.azurewebsites.net/items?lang=en&category=fallacies&wdt=P31&wd=Q186150
  getCategoryList(category: string, wdt: string, wd: string, language: string): Observable<ICategoryHttp> {
    const propertyValue = this.stateObj.getValue().config;
    console.log('propertyValue',propertyValue);
    const params = `?lang=${language}&category=${category}&wdt=${wdt}&wd=${wd}`;
    return this._http.get<ICategoryHttp>(this.strumosaUrl + this.lang);
  }

  getList(): Observable<ICategoryHttp> {
    const propertyValue = this.stateObj.getValue().config;
    console.log('propertyValue',propertyValue);
    if (!this.lang) {
      this.lang = '/en';
      console.log('used temp default')
    }
    return this._http.get<ICategoryHttp>(this.backendListUrl + this.lang);
  }

  getOfflineList(): Observable<Object> {
    const list = this._http.get('../../assets/data/wikidata.json');
    return list;
  }

  /**
  * fallacies&wdt=P31&wd=Q186150
  */
  createSPARQL(category: string, wdt: string, wd: string, language: string): string {
    // Aegyptus
    const sparql = `
        SELECT ?${category} ?${category}Label ?${category}Description WHERE {
            SERVICE wikibase:label {
                bd:serviceParam wikibase:language "[AUTO_LANGUAGE],${language}".
            }
            ?${category} wdt:${wdt} wd:${wd}.
        }
        LIMIT 1000`
        return wdk.sparqlQuery(sparql);
  }

}
