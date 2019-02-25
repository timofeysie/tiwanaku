import { GetEntities } from './../../store/actions/entity.actions';
import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { IAppState } from '../../store/state/app.state';
import { selectEntityList } from '../../store/selectors/entity.selector';
import { Router } from '@angular/router';

@Component({
  templateUrl: './entities.component.html',
  styleUrls: ['./entities.component.css']
})
export class EntitiesComponent implements OnInit {

    constructor(private _store: Store<IAppState>, private _router: Router) {}
        entities$ = this._store.pipe(select(selectEntityList));

    ngOnInit() {
        this._store.dispatch(new GetEntities());
    }

    navigateToEntity(id: number) {
        this._router.navigate(['entity', id]);
    }

}
