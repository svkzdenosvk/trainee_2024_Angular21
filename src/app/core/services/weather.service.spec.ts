import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WeatherService } from './weather.service';
import { CityService } from './city.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;
  let cityService: CityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
    cityService = TestBed.inject(CityService);
    cityService.selectCity({ name: 'London', country: 'UK', lat: 51.5, lon: -0.1 });
  });

  afterEach(() => httpMock.verify());

  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2024-03-15T12:00:00Z');
      expect(service.formatDate(date)).toBe('2024-03-15');
    });
  });

  describe('validateDateRange', () => {
    it('should return null for valid range', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-03-01');
      expect(service.validateDateRange([start, end])).toBeNull();
    });

    it('should return error for range over 90 days', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-06-01');
      expect(service.validateDateRange([start, end])).toBe('weather.errorRange');
    });

    it('should return error for null range', () => {
      expect(service.validateDateRange(null as any)).toBe('weather.errorValidRange');
    });

    it('should return error for empty array', () => {
      expect(service.validateDateRange([])).toBe('weather.errorValidRange');
    });

    it('should return error when second date missing', () => {
      expect(service.validateDateRange([new Date()])).toBe('weather.errorValidRange');
    });
  });

  describe('getDefaultDateRange', () => {
    it('should return range ending today', () => {
      const { end } = service.getDefaultDateRange();
      expect(service.formatDate(end)).toBe(service.formatDate(new Date()));
    });

    it('should return range starting 7 days ago', () => {
      const { start } = service.getDefaultDateRange();
      const expected = new Date();
      expected.setDate(expected.getDate() - 7);
      expect(service.formatDate(start)).toBe(service.formatDate(expected));
    });
  });

  describe('getForecastDateRange', () => {
    it('should return range starting today', () => {
      const { start } = service.getForecastDateRange();
      expect(service.formatDate(start)).toBe(service.formatDate(new Date()));
    });

    it('should return range ending 7 days from now', () => {
      const { end } = service.getForecastDateRange();
      const expected = new Date();
      expected.setDate(expected.getDate() + 7);
      expect(service.formatDate(end)).toBe(service.formatDate(expected));
    });
  });

  describe('getWeatherData', () => {
    const mockApiResponse = {
      latitude: 51.5,
      longitude: -0.1,
      timezone: 'Europe/London',
      hourly: {
        time: ['2024-01-01T00:00'],
        temperature_2m: [5.2],
        relativehumidity_2m: [80],
        surface_pressure: [1013],
        weathercode: [0],
        windspeed_10m: [10],
        precipitation: [0],
      },
    };

    it('should call API with correct params', () => {
      service.getWeatherData('2024-01-01', '2024-01-07').subscribe();
      const req = httpMock.expectOne(r => r.url.includes('open-meteo.com'));
      expect(req.request.params.get('latitude')).toBe('51.5');
      expect(req.request.params.get('longitude')).toBe('-0.1');
      req.flush(mockApiResponse);
    });

    it('should transform API response to WeatherRow[]', () => {
      service.getWeatherData('2024-01-01', '2024-01-07').subscribe(rows => {
        expect(rows.length).toBe(1);
        expect(rows[0].temperature).toBe(5.2);
        expect(rows[0].weatherState).toBe('weather.states.clearSky');
        expect(rows[0].weatherIcon).toBe('pi-sun');
        expect(rows[0].humidity).toBe(80);
        expect(rows[0].windSpeed).toBe(10);
      });
      const req = httpMock.expectOne(r => r.url.includes('open-meteo.com'));
      req.flush(mockApiResponse);
    });

    it('should map weathercode 0 to clearSky', () => {
      service.getWeatherData('2024-01-01', '2024-01-07').subscribe(rows => {
        expect(rows[0].weatherState).toBe('weather.states.clearSky');
      });
      httpMock.expectOne(r => r.url.includes('open-meteo.com'))
        .flush(mockApiResponse);
    });

    it('should map weathercode 95 to thunderstorm', () => {
      const thunderResponse = {
        ...mockApiResponse,
        hourly: { ...mockApiResponse.hourly, weathercode: [95] }
      };
      service.getWeatherData('2024-01-01', '2024-01-07').subscribe(rows => {
        expect(rows[0].weatherState).toBe('weather.states.thunderstorm');
      });
      httpMock.expectOne(r => r.url.includes('open-meteo.com'))
        .flush(thunderResponse);
    });
  });
});