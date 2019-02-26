import { Injectable } from '@angular/core';
import { Effect, ofType, Actions } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { of } from 'rxjs';
import { switchMap, map, withLatestFrom } from 'rxjs/operators';
import { IAppState } from '../state/app.state';
import {
  GetEntitiesSuccess,
  EEntityActions,
  GetEntitySuccess,
  GetEntity,
  GetEntities
} from '../actions/entity.actions';
import { EntityService } from '../../services/entity.service';
import { IEntityHttp } from '../../models/http-models/entity-http.interface';
import { selectEntityList } from '../selectors/entity.selector';

@Injectable()
export class EntityEffects {
  @Effect()
  getEntity$ = this._actions$.pipe(
    ofType<GetEntity>(EEntityActions.GetEntity),
    map(action => action.payload),
    withLatestFrom(this._store.pipe(select(selectEntityList))),
    switchMap(([id, entities]) => {
        console.log('EntityEffects.getEntity$ action$.pipe id',id);
          const selectedEntity = entities.filter(entity => entity.id === +id)[0];
          return of(new GetEntitySuccess(selectedEntity));
    })
);

  @Effect()
  getEntities$ = this._actions$.pipe(
    ofType<GetEntities>(EEntityActions.GetEntities),
    switchMap(() => this._entityService.getEntities()),
    switchMap((entityHttp: IEntityHttp) => of(new GetEntitiesSuccess(entityHttp.entities)))
  );

  constructor(
    private _entityService: EntityService,
    private _actions$: Actions,
    private _store: Store<IAppState>
  ) {}
}
