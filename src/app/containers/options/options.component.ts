import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { IAppState } from '../../store/state/app.state';
import { IFormState } from '../../store/state/form.state';
import { Store, select, Action } from '@ngrx/store';

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
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css']
})
export class OptionsComponent implements OnInit {
  public formState: IFormState;
  constructor(
    private theme: ThemeService,
    private store: Store<IAppState>) {
      // Subscribe to the newest version of the formState:
      this.store.pipe(select(e => e.form)).subscribe(fs => {
        this.formState = fs;
      });
  }

  ngOnInit() { }

  onFormActions($event: Action[]) {
    // whenever form (child) component emits event with actions as payload, dispatch them
    const actions = $event;
    actions.forEach(this.store.dispatch.bind(this.store));
  }

  changeTheme(name) {
    this.theme.setTheme(themes[name]);
  }

  changeSpeed(val) {
    this.theme.setVariable('--speed', `${val}ms`);
  }

}
