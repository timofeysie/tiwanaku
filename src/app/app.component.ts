import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { IAppState } from './store/state/app.state';
import { GetConfig } from './store/actions/config.actions';
import { selectConfig } from './store/selectors/config.selector';
import { selectEntityList } from './store/selectors/entity.selector';
import { Observable } from 'rxjs';
import { ThemeService } from './services/theme.service';

const themes = {
    autumn: {
      primary: '#F78154',
      secondary: '#4D9078',
      tertiary: '#B4436C',
      light: '#FDE8DF',
      medium: '#FCD0A2',
      dark: '#B89876'
    },
    night: {
      primary: '#8CBA80',
      secondary: '#FCFF6C',
      tertiary: '#FE5F55',
      medium: '#BCC2C7',
      dark: '#F7F7FF',
      light: '#495867'
    },
    neon: {
      primary: '#39BFBD',
      secondary: '#4CE0B3',
      tertiary: '#FF5E79',
      light: '#F4EDF2',
      medium: '#B682A5',
      dark: '#34162A'
    }
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'cognitive biases';
  config$ = this._store.pipe(select(selectConfig));
  error$: Observable<any>;
  entities$ = this._store.pipe(select(selectEntityList));

  constructor(
      private _store: Store<IAppState>,
      private theme: ThemeService) {
      this.error$ = _store.pipe(select('error'));
      this.theme.setTheme('night');
  }

  ngOnInit() {
    this._store.dispatch(new GetConfig());
  }

}
