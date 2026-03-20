import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityPicker } from './city-picker';

describe('CityPicker', () => {
  let component: CityPicker;
  let fixture: ComponentFixture<CityPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityPicker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CityPicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
