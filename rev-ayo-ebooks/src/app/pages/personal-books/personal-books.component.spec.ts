import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalBooksComponent } from './personal-books.component';

describe('PersonalBooksComponent', () => {
  let component: PersonalBooksComponent;
  let fixture: ComponentFixture<PersonalBooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalBooksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
