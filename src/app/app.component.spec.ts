import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import {RouterTestingModule} from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import * as appReducers from './store/reducers/app.reducers';
import * as entityReducers from './store/reducers/entity.reducers';
import * as EntityActions from './store/actions/entity.actions';

describe('AppComponent', () => {
  let component: AppComponent;
  //let fixture: ComponentFixture<AppComponent>
  let store: Store<fromFeature.State>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ], imports: [
          RouterTestingModule,
          StoreModule.forRoot({
          ...appReducers.entityReducers
        }) ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'app'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('cognitive biases');
  }));
  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    console.log('sdf',compiled.querySelector('a').textContent);
    expect(compiled.querySelector('a').textContent).toContain('  -  ');
  }));
});
