import { GetCategories } from './../../store/actions/category.actions';
import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { IAppState } from '../../store/state/app.state';
import { selectCategoryList } from '../../store/selectors/category.selector';
import { Router } from '@angular/router';

@Component({
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
    categories$ = this._store.pipe(select(selectCategoryList));
 
    constructor(private _store: Store<IAppState>, private _router: Router) { }

    ngOnInit() {
        this._store.dispatch(new GetCategories());
    }

}
