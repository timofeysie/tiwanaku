import { TestBed, inject } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { CategoriesComponent } from '../components/categories/categories.component';
import { HttpClientModule } from '@angular/common/http';
import { Store, select } from '@ngrx/store';
import { StateObservable } from '@ngrx/store';
import { StoreModule } from '@ngrx/store';

describe('CategoryService', () => {
    //const testStore = jasmine.createSpyObj('Store', ['select']);
    //const fakeStateObservable = { } as StateObservable;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CategoryService,
        Store,
        { provide: StateObservable, useValue: fakeStateObservable},
      ],
      imports: [ HttpClientModule, StoreModule.forRoot({}) ]
    });
  });

  it('should be created', inject([CategoryService], (service: CategoryService) => {
    expect(service).toBeTruthy();
  }));
});
