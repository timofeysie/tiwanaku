import { Action } from '@ngrx/store';

import { IEntity } from '../../models/entity.interface';

export enum EEntityActions {
  GetEntities = '[Entity] Get Entities',
  GetEntitiesSuccess = '[Entity] Get Entities Success',
  GetEntity = '[Entity] Get Entity',
  GetEntitySuccess = '[Entity] Get Entity Success'
}

export class GetEntities implements Action {
  public readonly type = EEntityActions.GetEntities;
}

export class GetEntitiesSuccess implements Action {
  public readonly type = EEntityActions.GetEntitiesSuccess;
  constructor(public payload: IEntity[]) {
    console.log('payload', payload);
  }
}

export class GetEntity implements Action {
  public readonly type = EEntityActions.GetEntity;
  constructor(public payload: number) {
  }
}

export class GetEntitySuccess implements Action {
  public readonly type = EEntityActions.GetEntitySuccess;
  constructor(public payload: IEntity) { }
}

export type EntityActions = GetEntities | GetEntitiesSuccess | GetEntity | GetEntitySuccess;
