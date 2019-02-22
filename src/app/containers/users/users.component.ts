import { GetUsers } from './../../store/actions/user.actions';
import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { IAppState } from '../../store/state/app.state';
import { selectUserList } from '../../store/selectors/user.selector';
import { Router } from '@angular/router';

@Component({
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

    constructor(private _store: Store<IAppState>, private _router: Router) {}
        users$ = this._store.pipe(select(selectUserList));

    ngOnInit() {
        this._store.dispatch(new GetUsers());
    }

    navigateToUser(id: number) {
        this._router.navigate(['user', id]);
    }

}
