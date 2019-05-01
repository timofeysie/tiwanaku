import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';
import { IAppState } from '../../store/state/app.state';
import { selectSelectedEntity } from '../../store/selectors/entity.selector';
import { GetEntity } from '../../store/actions/entity.actions';

@Component({
    templateUrl: './entity.component.html',
    styleUrls: ['./entity.component.css']
})
export class EntityComponent implements OnInit {
    entity$: any;
    constructor(
      public activatedRoute: ActivatedRoute,
      public router: Router,
      private _store: Store<IAppState>,
      private _route: ActivatedRoute) { }

    ngOnInit() {
      this.entity$ = this.activatedRoute.paramMap.pipe(
        map(() => window.history.state.data)
      );
      console.log('this.entity$',this.entity$)
      //this._store.dispatch(new GetEntity(this._route.snapshot.params.cognitive_bias));
    }
}
