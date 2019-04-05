import { IEntity } from '../../models/entity.interface';

export interface IEntityState {
  entities: IEntity[];
  entitiesCount: number;
  selectedEntity: IEntity;
}

export const initialEntityState: IEntityState = {
  entities: null,
  entitiesCount: 0,
  selectedEntity: null
};
