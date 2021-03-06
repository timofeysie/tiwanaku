import { TestBed, inject } from '@angular/core/testing';
import { EntityService } from './entity.service';
import { EntitiesComponent } from '../components/entities/entities.component';
import { HttpClientModule } from '@angular/common/http';
import { Store, select } from '@ngrx/store';
import { StateObservable } from '@ngrx/store';
import { StoreModule } from '@ngrx/store';

describe('EntityService', () => {
    //const testStore = jasmine.createSpyObj('Store', ['select']);
    //const fakeStateObservable = { } as StateObservable;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EntityService,
        Store,
        { provide: StateObservable, useValue: fakeStateObservable},
      ],
      imports: [ HttpClientModule, StoreModule.forRoot({}) ]
    });
  });

  it('should be created', inject([EntityService], (service: EntityService) => {
    expect(service).toBeTruthy();
  }));
});
