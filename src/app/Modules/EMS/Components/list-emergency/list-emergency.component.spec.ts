import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEmergencyComponent } from './list-emergency.component';

describe('ListEmergencyComponent', () => {
  let component: ListEmergencyComponent;
  let fixture: ComponentFixture<ListEmergencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListEmergencyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListEmergencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
