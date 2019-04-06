import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { IAppState } from './store/state/app.state';
import { GetConfig } from './store/actions/config.actions';
import { selectConfig } from './store/selectors/config.selector';
import { selectEntityList } from './store/selectors/entity.selector';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-ngrx';
  config$ = this._store.pipe(select(selectConfig));
  error$: Observable<any>;
  entities$ = this._store.pipe(select(selectEntityList));

  constructor(private _store: Store<IAppState>) {
      this.error$ = _store.pipe(select('error'));
  }

  ngOnInit() {
    this._store.dispatch(new GetConfig());
  }

}
