import { Action } from '@ngrx/store';
import { ICategory } from '../../models/category.interface';

export enum ECategoryActions {
  GetCategories = '[Category] Get Categories',
  GetCategoriesSuccess = '[Category] Get Categories Success',
  GetCategory  = '[Category] Get Category',
  GetCategorySuccess = '[Category] Get Category Success'
}

export class GetCategories implements Action {
  public readonly type = ECategoryActions.GetCategories;
}

export class GetCategoriesSuccess implements Action {
  public readonly type = ECategoryActions.GetCategoriesSuccess;
  constructor(public payload: ICategory[]) { }
}

export class GetCategory implements Action {
  public readonly type = ECategoryActions.GetCategory;
  constructor(public payload: string) { }
}

export class GetCategorySuccess implements Action {
  public readonly type = ECategoryActions.GetCategorySuccess;
  constructor(public payload: ICategory) { }
}

/** TypeScript union type */
export type CategoryActions = GetCategories | GetCategoriesSuccess | GetCategory | GetCategorySuccess;
