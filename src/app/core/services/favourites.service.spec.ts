import { TestBed } from '@angular/core/testing';
import { FavouritesService } from './favourites.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { City } from '../models/weather.model';

const mockCity1: City = { name: 'London', country: 'UK', lat: 51.5, lon: -0.1 };
const mockCity2: City = { name: 'Paris', country: 'FR', lat: 48.8, lon: 2.3 };
const mockCity3: City = { name: 'Berlin', country: 'DE', lat: 52.5, lon: 13.4 };

describe('FavouritesService', () => {
  let service: FavouritesService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { navigate: vi.fn() } }],
    });

    // simulujeme prihláseného usera
    const auth = TestBed.inject(AuthService);
    auth.login('user', 'user123');

    service = TestBed.inject(FavouritesService);
    service.reloadForUser();
  });

  afterEach(() => localStorage.clear());

  describe('add', () => {
    it('should add a city', () => {
      service.add(mockCity1);
      expect(service.favourites().length).toBe(1);
      expect(service.favourites()[0].name).toBe('London');
    });

    it('should not add duplicate city', () => {
      service.add(mockCity1);
      service.add(mockCity1);
      expect(service.favourites().length).toBe(1);
    });

    it('should not add city with empty name', () => {
      service.add({ ...mockCity1, name: '' });
      expect(service.favourites().length).toBe(0);
    });

    it('should not add city with empty country', () => {
      service.add({ ...mockCity1, country: '' });
      expect(service.favourites().length).toBe(0);
    });

    it('should not add when full', () => {
      for (let i = 0; i < 10; i++) {
        service.add({ name: `City${i}`, country: 'XX', lat: i, lon: i });
      }
      service.add(mockCity1);
      expect(service.favourites().length).toBe(10);
    });
  });

  describe('remove', () => {
    it('should remove a city', () => {
      service.add(mockCity1);
      service.remove(mockCity1);
      expect(service.favourites().length).toBe(0);
    });

    it('should remove correct city when multiple exist', () => {
      service.add(mockCity1);
      service.add(mockCity2);
      service.remove(mockCity1);
      expect(service.favourites().length).toBe(1);
      expect(service.favourites()[0].name).toBe('Paris');
    });

    it('should do nothing when removing non-existent city', () => {
      service.add(mockCity1);
      service.remove(mockCity2);
      expect(service.favourites().length).toBe(1);
    });
  });

  describe('isFavourite', () => {
    it('should return true for added city', () => {
      service.add(mockCity1);
      expect(service.isFavourite(mockCity1)).toBe(true);
    });

    it('should return false for non-added city', () => {
      expect(service.isFavourite(mockCity1)).toBe(false);
    });
  });

  describe('isFull', () => {
    it('should return false when under limit', () => {
      service.add(mockCity1);
      expect(service.isFull()).toBe(false);
    });

    it('should return true when at limit', () => {
      for (let i = 0; i < 10; i++) {
        service.add({ name: `City${i}`, country: 'XX', lat: i, lon: i });
      }
      expect(service.isFull()).toBe(true);
    });
  });

  describe('persistence', () => {
    it('should persist to localStorage after add', () => {
      service.add(mockCity1);
      const stored = JSON.parse(localStorage.getItem('favourites_2') ?? '[]');
      expect(stored.length).toBe(1);
      expect(stored[0].name).toBe('London');
    });

    it('should persist to localStorage after remove', () => {
      service.add(mockCity1);
      service.remove(mockCity1);
      const stored = JSON.parse(localStorage.getItem('favourites_2') ?? '[]');
      expect(stored.length).toBe(0);
    });
  });

  describe('reloadForUser', () => {
    it('should reload favourites from storage', () => {
      service.add(mockCity1);
      service.add(mockCity2);
      service.reloadForUser();
      expect(service.favourites().length).toBe(2);
    });
  });
});
