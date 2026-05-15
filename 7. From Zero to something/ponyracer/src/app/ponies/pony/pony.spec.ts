import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pony } from './pony';

describe('Pony', () => {
  let component: Pony;
  let fixture: ComponentFixture<Pony>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pony],
    }).compileComponents();

    fixture = TestBed.createComponent(Pony);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
