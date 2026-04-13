import { TestBed } from '@angular/core/testing';
import { CityService } from './city.service';

describe('CityService', () => {
  let service: CityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CityService);
  });

  describe('selectCity', () => {
    it('should set selected city', () => {
      service.selectCity({ name: 'London', country: 'UK', lat: 51.5, lon: -0.1 });
      expect(service.selectedCity()?.name).toBe('London');
    });
  });

  describe('clearCity', () => {
    it('should clear selected city', () => {
      service.selectCity({ name: 'London', country: 'UK', lat: 51.5, lon: -0.1 });
      service.clearCity();
      expect(service.selectedCity()).toBeNull();
    });
  });

  describe('loadFromUrl', () => {
    it('should load valid city from params', () => {
      const result = service.loadFromUrl({
        city: 'London', country: 'UK', lat: '51.5', lon: '-0.1'
      });
      expect(result).toBe(true);
      expect(service.selectedCity()?.name).toBe('London');
    });

    it('should return false for missing city name', () => {
      expect(service.loadFromUrl({ lat: '51.5', lon: '-0.1' })).toBe(false);
    });

    it('should return false for empty city name', () => {
      expect(service.loadFromUrl({ city: '  ', lat: '51.5', lon: '-0.1' })).toBe(false);
    });

    it('should return false for invalid lat', () => {
      expect(service.loadFromUrl({ city: 'London', lat: 'abc', lon: '-0.1' })).toBe(false);
    });

    it('should return false for invalid lon', () => {
      expect(service.loadFromUrl({ city: 'London', lat: '51.5', lon: 'xyz' })).toBe(false);
    });

    it('should return false for lat out of range', () => {
      expect(service.loadFromUrl({ city: 'London', lat: '91', lon: '-0.1' })).toBe(false);
    });

    it('should return false for lon out of range', () => {
      expect(service.loadFromUrl({ city: 'London', lat: '51.5', lon: '181' })).toBe(false);
    });

    it('should trim city name', () => {
      service.loadFromUrl({ city: '  London  ', country: 'UK', lat: '51.5', lon: '-0.1' });
      expect(service.selectedCity()?.name).toBe('London');
    });

    it('should default country to empty string if missing', () => {
      service.loadFromUrl({ city: 'London', lat: '51.5', lon: '-0.1' });
      expect(service.selectedCity()?.country).toBe('');
    });
  });
});
