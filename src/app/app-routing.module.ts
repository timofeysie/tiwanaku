import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EntitiesComponent } from './containers/entities/entities.component';
import { EntityComponent } from './containers/entity/entity.component';

const routes: Routes = [
  { path: 'entities', component: EntitiesComponent },
  { path: 'entity/:id', component: EntityComponent },
  { path: '', redirectTo: '/entities', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
