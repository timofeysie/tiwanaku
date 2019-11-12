import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';
import { IAppState } from '../../store/state/app.state';
import { selectSelectedCategory } from '../../store/selectors/category.selector';
import { GetCategory } from '../../store/actions/category.actions';

@Component({
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
    category$: any;
    constructor(
      public activatedRoute: ActivatedRoute,
      public router: Router,
      private _store: Store<IAppState>,
      private _route: ActivatedRoute) { }

    ngOnInit() {
      this.category$ = this.activatedRoute.paramMap.pipe(
        map(() => window.history.state.data)
      );
      console.log('this.category$',this.category$)
      //this._store.dispatch(new GetCategory(this._route.snapshot.params.cognitive_bias));
    }
}
