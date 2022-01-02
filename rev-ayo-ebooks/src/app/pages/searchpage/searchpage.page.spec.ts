import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPage } from './searchpage.component';

describe('SearchpageComponent', () => {
  let component: SearchPage;
  let fixture: ComponentFixture<SearchPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
