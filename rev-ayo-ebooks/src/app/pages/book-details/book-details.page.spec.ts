import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookDetailsPage } from './book-details.component';

describe('BookDetailsComponent', () => {
  let component: BookDetailsPage;
  let fixture: ComponentFixture<BookDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookDetailsPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
