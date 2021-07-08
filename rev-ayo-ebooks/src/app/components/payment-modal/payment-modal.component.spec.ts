import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentModal } from './payment-modal.component';

describe('PaymentBottomSheetComponent', () => {
  let component: PaymentModal;
  let fixture: ComponentFixture<PaymentModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentModal ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
