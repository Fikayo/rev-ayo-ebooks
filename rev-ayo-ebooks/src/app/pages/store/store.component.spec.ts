import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StorePage } from './store.component';

describe('StoreComponent', () => {
  let component: StorePage;
  let fixture: ComponentFixture<StorePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StorePage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
