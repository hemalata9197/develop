import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolePrivilegesComponent } from './role-privileges.component';

describe('RolePrivilegesComponent', () => {
  let component: RolePrivilegesComponent;
  let fixture: ComponentFixture<RolePrivilegesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolePrivilegesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolePrivilegesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
