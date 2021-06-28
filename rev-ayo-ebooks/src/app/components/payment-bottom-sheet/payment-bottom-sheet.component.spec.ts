import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentBottomSheetComponent } from './payment-bottom-sheet.component';

describe('PaymentBottomSheetComponent', () => {
  let component: PaymentBottomSheetComponent;
  let fixture: ComponentFixture<PaymentBottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentBottomSheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
