import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FavouritesService } from './favourites.service';
import { AuthService } from './auth.service';
import { API_URL } from '../constants/constants';
import { City } from '../models/weather.model';

const mockCity1: City = { name: 'London', country: 'GB', lat: 51.5, lon: -0.1 };
const mockCity2: City = { name: 'Paris', country: 'FR', lat: 48.8, lon: 2.3 };

describe('FavouritesService', () => {
  let service: FavouritesService;
  let http: HttpTestingController;
  let authService: { isLoggedIn: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authService = { isLoggedIn: vi.fn().mockReturnValue(true) };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FavouritesService,
        { provide: AuthService, useValue: authService },
      ],
    });

    service = TestBed.inject(FavouritesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('add', () => {
    it('should add a city', () => {
      service.add(mockCity1);

      http.expectOne(`${API_URL}/favourites`).flush({ ...mockCity1, id: '1' });
      // reloadForUser GET
      http.expectOne(`${API_URL}/favourites`).flush([{ ...mockCity1, id: '1' }]);

      expect(service.favourites().length).toBe(1);
      expect(service.favourites()[0].name).toBe('London');
    });

    it('should not add duplicate city', () => {
      service.favourites.set([mockCity1]);
      service.add(mockCity1);
      http.expectNone(`${API_URL}/favourites`);
      expect(service.favourites().length).toBe(1);
    });

    it('should not add city with empty name', () => {
      service.add({ ...mockCity1, name: '' });
      http.expectNone(`${API_URL}/favourites`);
    });

    it('should not add city with empty country', () => {
      service.add({ ...mockCity1, country: '' });
      http.expectNone(`${API_URL}/favourites`);
    });

    it('should not add when full', () => {
      const cities = Array.from({ length: 10 }, (_, i) => ({
        name: `City${i}`, country: 'XX', lat: i, lon: i,
      }));
      service.favourites.set(cities);
      service.add(mockCity1);
      http.expectNone(`${API_URL}/favourites`);
      expect(service.favourites().length).toBe(10);
    });
  });

  describe('remove', () => {
    it('should remove a city', () => {
      service.favourites.set([{ ...mockCity1, id: '1' } as any]);
      service.remove(mockCity1);

      http.expectOne(`${API_URL}/favourites/1`).flush({});
      http.expectOne(`${API_URL}/favourites`).flush([]);

      expect(service.favourites().length).toBe(0);
    });

    it('should remove correct city when multiple exist', () => {
      service.favourites.set([
        { ...mockCity1, id: '1' } as any,
        { ...mockCity2, id: '2' } as any,
      ]);
      service.remove(mockCity1);

      http.expectOne(`${API_URL}/favourites/1`).flush({});
      http.expectOne(`${API_URL}/favourites`).flush([{ ...mockCity2, id: '2' }]);

      expect(service.favourites().length).toBe(1);
      expect(service.favourites()[0].name).toBe('Paris');
    });

    it('should do nothing when removing non-existent city', () => {
      service.favourites.set([{ ...mockCity1, id: '1' } as any]);
      service.remove(mockCity2);
      http.expectNone(`${API_URL}/favourites/`);
      expect(service.favourites().length).toBe(1);
    });
  });

  describe('isFavourite', () => {
    it('should return true for added city', () => {
      service.favourites.set([mockCity1]);
      expect(service.isFavourite(mockCity1)).toBe(true);
    });

    it('should return false for non-added city', () => {
      service.favourites.set([mockCity1]);
      expect(service.isFavourite(mockCity2)).toBe(false);
    });
  });

  describe('isFull', () => {
    it('should return false when under limit', () => {
      service.favourites.set([mockCity1]);
      expect(service.isFull()).toBe(false);
    });

    it('should return true when at limit', () => {
      const cities = Array.from({ length: 10 }, (_, i) => ({
        name: `City${i}`, country: 'XX', lat: i, lon: i,
      }));
      service.favourites.set(cities);
      expect(service.isFull()).toBe(true);
    });
  });

  describe('reloadForUser', () => {
    it('should load favourites from API when logged in', () => {
      service.reloadForUser();
      http.expectOne(`${API_URL}/favourites`).flush([mockCity1, mockCity2]);
      expect(service.favourites().length).toBe(2);
    });

    it('should clear favourites when not logged in', () => {
      authService.isLoggedIn.mockReturnValue(false);
      service.favourites.set([mockCity1]);
      service.reloadForUser();
      http.expectNone(`${API_URL}/favourites`);
      expect(service.favourites().length).toBe(0);
    });
  });
});