import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitEmergencyComponent } from './submit-emergency.component';

describe('SubmitEmergencyComponent', () => {
  let component: SubmitEmergencyComponent;
  let fixture: ComponentFixture<SubmitEmergencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitEmergencyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitEmergencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
