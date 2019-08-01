import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EntitiesComponent } from './entities.component';
import { Store } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { cold } from 'jasmine-marbles';

describe('EntitiesComponent', () => {
  let component: EntitiesComponent;
  let fixture: ComponentFixture<EntitiesComponent>;
  let store: MockStore<{ entities: any, selectedEntity: any }>;
  const initialState = { entities: null, selectedEntity: null };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntitiesComponent ],
      providers: [ provideMockStore({ initialState }) ]
    })
    .compileComponents();
  }));
  store = TestBed.get<Store>(Store);
  guard = TestBed.get<AuthGuard>(AuthGuard);

  beforeEach(() => {
    fixture = TestBed.createComponent(EntitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
