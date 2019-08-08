import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EntitiesComponent } from './entities.component';

describe('EntitiesComponent', () => {
  let component: EntitiesComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntitiesComponent ]
    })
    .compileComponents();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
