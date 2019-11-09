import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { IAppState } from '../../store/state/app.state';
import { IFormState } from '../../store/state/form.state';
import { Store, select, Action } from '@ngrx/store';
import { EntityService } from '../../services/entity.service';
import { SwUpdate } from '@angular/service-worker';
import { LogUpdateService } from '../../services/log-update.service';

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
    updateCheckText = '';
    public formState: IFormState;

    /**
     * Subscribe to the newest version of the formState.
     */
    constructor(
        private theme: ThemeService,
        private store: Store<IAppState>,
        private entityService: EntityService,
        private logUpdateService: LogUpdateService,
        private update: SwUpdate) {
            this.store.pipe(select(e => e.form)).subscribe(fs => {
                this.formState = fs;
        });
    }

    ngOnInit() { 
      console.log('update event',this.logUpdateService.getEvent());
    }

    updateCheck(): void {
        this.update
            .checkForUpdate()
            .then(() => this.updateCheckText = 'resolved')
            .catch(err => this.updateCheckText = `rejected: ${err.message}`);
    }

    onFormActions($event: Action[]) {
        // fallacies&wdt=P31&wd=Q186150
        // const kiss = this.entityService.createSPARQL('fallacies','P31','Q186150', 'en');
        // cognitive_bias wdt:P31 wd:Q1127759.
        const kiss = this.entityService.createSPARQL('cognitive_bias','P31','Q1127759', 'en');
        console.log('event', kiss);
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
