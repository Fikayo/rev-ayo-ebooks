import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooksetComponent } from './bookset.component';

describe('BooksetComponent', () => {
  let component: BooksetComponent;
  let fixture: ComponentFixture<BooksetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BooksetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BooksetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
