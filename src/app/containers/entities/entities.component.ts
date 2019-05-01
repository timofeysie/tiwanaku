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
    entities$ = this._store.pipe(select(selectEntityList));

    constructor(private _store: Store<IAppState>, private _router: Router) { }

    ngOnInit() {
        this._store.dispatch(new GetEntities());
    }

    // navigateToEntity(entity: Object) {
    //     this._router.navigate(['entity', { state: entity}]);
    // }

}
