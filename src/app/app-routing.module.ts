import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntitiesComponent } from './containers/entities/entities.component';
import { EntityComponent } from './containers/entity/entity.component';
import { OptionsComponent } from './containers/options/options.component';

const routes: Routes = [
  { path: 'entities', component: EntitiesComponent },
  { path: 'entity', component: EntityComponent },
  { path: 'options', component: OptionsComponent },
  { path: 'entity/:id', component: EntityComponent },
  { path: '', redirectTo: '/entities', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
