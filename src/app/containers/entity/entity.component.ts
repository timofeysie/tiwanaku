import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { IAppState } from '../../store/state/app.state';
import { selectSelectedEntity } from '../../store/selectors/entity.selector';
import { GetEntity } from '../../store/actions/entity.actions';

@Component({
    templateUrl: './entity.component.html',
    styleUrls: ['./entity.component.css']
})
export class EntityComponent implements OnInit {
    entity$ = this._store.pipe(select(selectSelectedEntity));

    constructor(
        private _store: Store<IAppState>,
        private _route: ActivatedRoute) { }

    ngOnInit() {
        this._store.dispatch(new GetEntity(this._route.snapshot.params.id));
    }
}
