import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {catchError} from 'rxjs/internal/operators';
import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs/index';
import {Store} from '@ngrx/store';
import { AddGlobalError } from '../store/actions/globalError.actions';
import { IAppState } from '../store/state/app.state';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private store: Store<IAppState>
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next
      .handle(request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.store.dispatch(new AddGlobalError(error));
          return throwError(error);
        })
      )
  }
}
