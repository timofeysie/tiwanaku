import { IEntity } from '../../models/entity.interface';

export interface IEntityState {
  entities: IEntity[];
  selectedEntity: IEntity;
}

export const initialEntityState: IEntityState = {
  entities: null,
  selectedEntity: null
};
