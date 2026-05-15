import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ponies } from './ponies';

describe('Ponies', () => {
  let component: Ponies;
  let fixture: ComponentFixture<Ponies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ponies],
    }).compileComponents();

    fixture = TestBed.createComponent(Ponies);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
