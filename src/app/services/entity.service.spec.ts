import { TestBed, inject } from '@angular/core/testing';
import { EntityService } from './entity.service';
import { HttpClientModule } from '@angular/common/http';
import { Store, select } from '@ngrx/store';
import { StateObservable } from '@ngrx/store';

describe('EntityService', () => {
  const testStore = jasmine.createSpyObj('Store', ['select']);
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ EntityService, Store, StateObservable ],
      imports: [ HttpClientModule ]
    });
  });

  it('should be created', inject([EntityService], (service: EntityService) => {
    expect(service).toBeTruthy();
  }));
});
