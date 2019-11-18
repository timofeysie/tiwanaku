import { Injectable } from '@angular/core';
import { Effect, ofType, Actions } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { of } from 'rxjs';
import { switchMap, map, withLatestFrom } from 'rxjs/operators';
import { IAppState } from '../state/app.state';
import {
  GetCategoriesSuccess,
  ECategoryActions,
  GetCategorySuccess,
  GetCategory,
  GetCategories
} from '../actions/category.actions';
import { CategoryService } from '../../services/category.service';
import { ICategoryHttp } from '../../models/http-models/category-http.interface';
import { selectCategoryList } from '../selectors/category.selector';

@Injectable()
export class CategoryEffects {
  @Effect()
  getCategory$ = this._actions$.pipe(
    ofType<GetCategory>(ECategoryActions.GetCategory),
    map(action => action.payload),
    withLatestFrom(this._store.pipe(select(selectCategoryList))),
    switchMap(([cognitive_bias, categories]) => {
          const selectedCategory = categories.filter(category => category.category)[0];
          return of(new GetCategorySuccess(selectedCategory));
    })
);

  @Effect()
  getCategories$ = this._actions$.pipe(
    ofType<GetCategories>(ECategoryActions.GetCategories),
    switchMap(() => this._categoryService.getOfflineList()),
    switchMap((categoryHttp: ICategoryHttp) => of(new GetCategoriesSuccess(categoryHttp.list)))
  );

  constructor(
    private _categoryService: CategoryService,
    private _actions$: Actions,
    private _store: Store<IAppState>
  ) {}
}
