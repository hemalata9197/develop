import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterWrapperComponent } from './master-wrapper.component';

describe('MasterWrapperComponent', () => {
  let component: MasterWrapperComponent;
  let fixture: ComponentFixture<MasterWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
