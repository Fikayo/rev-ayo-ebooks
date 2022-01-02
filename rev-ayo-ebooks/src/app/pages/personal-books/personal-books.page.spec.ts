import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalBooksPage } from './personal-books.component';

describe('PersonalBooksComponent', () => {
  let component: PersonalBooksPage;
  let fixture: ComponentFixture<PersonalBooksPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalBooksPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalBooksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
