import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { IAppState } from './store/state/app.state';
import { GetConfig } from './store/actions/config.actions';
import { selectConfig } from './store/selectors/config.selector';
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

  constructor(private _store: Store<IAppState>) {
    console.log('store',_store);
      this.error$ = _store.pipe(select('error'));
      // the store and the errors$ are the same object,
      // so not sure what pipe is doing...
  }

  ngOnInit() {
    this._store.dispatch(new GetConfig());
  }

}
