import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReaderPage } from './reader.component';

describe('ReadComponent', () => {
  let component: ReaderPage;
  let fixture: ComponentFixture<ReaderPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReaderPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReaderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
