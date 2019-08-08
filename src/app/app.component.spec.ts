import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { EntitiesComponent } from './components/entities/entities.component';
import { EntityDetailsComponent } from './components/entity-details/entity-details.component';
import { IAppState } from './store/state/app.state';
import { appReducers } from './store/reducers/app.reducers';
import { GetEntities } from './store/actions/entity.actions';
import { IEntity } from './models/entity.interface';
import { GetEntitiesSuccess } from './store/actions/entity.actions';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: Store<IAppState>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), StoreModule.forRoot({})],
      declarations: [
        AppComponent
      ],
      providers: [ Store, AppComponent ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
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
