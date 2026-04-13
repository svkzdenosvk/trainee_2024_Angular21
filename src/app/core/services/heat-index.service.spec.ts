import { TestBed } from '@angular/core/testing';
import { HeatIndexService } from './heat-index.service';
import { HeatIndexEntry } from '../models/weather.model';

describe('HeatIndexService', () => {
  let service: HeatIndexService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeatIndexService);
  });

  afterEach(() => localStorage.clear());

  describe('toFahrenheit', () => {
    it('should convert 0°C to 32°F', () => {
      expect(service.toFahrenheit(0)).toBe(32);
    });

    it('should convert 100°C to 212°F', () => {
      expect(service.toFahrenheit(100)).toBe(212);
    });

    it('should convert 26.7°C to approximately 80°F', () => {
      expect(service.toFahrenheit(26.7)).toBeCloseTo(80.06, 1);
    });
  });

  describe('toCelsius', () => {
    it('should convert 32°F to 0°C', () => {
      expect(service.toCelsius(32)).toBe(0);
    });

    it('should convert 212°F to 100°C', () => {
      expect(service.toCelsius(212)).toBe(100);
    });
  });

  describe('getMinTemp', () => {
    it('should return 26.7 for Celsius', () => {
      expect(service.getMinTemp('°C')).toBe(26.7);
    });

    it('should return 80 for Fahrenheit', () => {
      expect(service.getMinTemp('°F')).toBe(80);
    });
  });

  describe('calculateF', () => {
    it('should return null for temp below 80°F', () => {
      expect(service.calculateF(79, 50)).toBeNull();
    });

    it('should return a number for temp at 80°F', () => {
      expect(service.calculateF(80, 50)).not.toBeNull();
    });

    it('should return higher heat index for higher humidity', () => {
      const low = service.calculateF(90, 40)!;
      const high = service.calculateF(90, 80)!;
      expect(high).toBeGreaterThan(low);
    });

    it('should return higher heat index for higher temperature', () => {
      const low = service.calculateF(85, 60)!;
      const high = service.calculateF(95, 60)!;
      expect(high).toBeGreaterThan(low);
    });
  });

  describe('calculate', () => {
    it('should return null when temp too low in Celsius', () => {
      expect(service.calculate(20, 50, '°C')).toBeNull();
    });

    it('should return null when temp too low in Fahrenheit', () => {
      expect(service.calculate(79, 50, '°F')).toBeNull();
    });

    it('should return result in Celsius for °C input', () => {
      const result = service.calculate(35, 70, '°C');
      expect(result).not.toBeNull();
      // výsledok musí byť v rozumnom rozsahu °C
      expect(result!).toBeGreaterThan(35);
      expect(result!).toBeLessThan(60);
    });

    it('should return result in Fahrenheit for °F input', () => {
      const result = service.calculate(95, 70, '°F');
      expect(result).not.toBeNull();
      expect(result!).toBeGreaterThan(95);
    });

    it('should be consistent - °C and °F should give same real-world value', () => {
      const resultC = service.calculate(35, 60, '°C')!;
      const resultF = service.calculate(service.toFahrenheit(35), 60, '°F')!;
      expect(service.toFahrenheit(resultC)).toBeCloseTo(resultF, 0);
    });
  });

  describe('saveToHistory', () => {
    const mockEntry: HeatIndexEntry = {
      temperature: 35,
      humidity: 70,
      heatIndex: 42,
      unit: '°C',
      timestamp: new Date('2024-01-01'),
    };

    it('should save entry to history', () => {
      service.saveToHistory(mockEntry);
      const history = service.loadHistory();
      expect(history.length).toBe(1);
    });

    it('should prepend new entries', () => {
      const entry1 = { ...mockEntry, temperature: 30 };
      const entry2 = { ...mockEntry, temperature: 35 };
      service.saveToHistory(entry1);
      service.saveToHistory(entry2);
      expect(service.loadHistory()[0].temperature).toBe(35);
    });

    it('should limit history to 5 entries', () => {
      for (let i = 0; i < 7; i++) {
        service.saveToHistory({ ...mockEntry, temperature: 30 + i });
      }
      expect(service.loadHistory().length).toBe(5);
    });
  });

  describe('loadHistory', () => {
    it('should return empty array when no history', () => {
      expect(service.loadHistory()).toEqual([]);
    });

    it('should parse timestamps as Date objects', () => {
      const entry: HeatIndexEntry = {
        temperature: 35,
        humidity: 70,
        heatIndex: 42,
        unit: '°C',
        timestamp: new Date('2024-01-01'),
      };
      service.saveToHistory(entry);
      const loaded = service.loadHistory();
      expect(loaded[0].timestamp).toBeInstanceOf(Date);
    });

    it('should return empty array on corrupted storage', () => {
      localStorage.setItem('heatIndexHistory', 'invalid json {{{');
      expect(service.loadHistory()).toEqual([]);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      service.saveToHistory({
        temperature: 35,
        humidity: 70,
        heatIndex: 42,
        unit: '°C',
        timestamp: new Date(),
      });
      service.clearHistory();
      expect(service.loadHistory()).toEqual([]);
    });
  });
});
