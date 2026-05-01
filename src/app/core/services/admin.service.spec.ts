import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AdminService } from './admin.service';
import { API_URL } from '../constants/constants';
import { Role } from '../models/role.enum';
import { UserWithStats } from '../models/user.model';

const mockUsers: UserWithStats[] = [
  { id: '1', username: 'alice', role: Role.ADMIN } as UserWithStats,
  { id: '2', username: 'bob', role: Role.USER } as UserWithStats,
];

describe('AdminService', () => {
  let service: AdminService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService],
    });
    service = TestBed.inject(AdminService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('loadUsers', () => {
    it('should load users from API', () => {
      service.loadUsers();
      http.expectOne(`${API_URL}/admin/users`).flush(mockUsers);
      expect(service.users().length).toBe(2);
      expect(service.users()[0].username).toBe('alice');
    });

    it('should start with empty users signal', () => {
      expect(service.users()).toEqual([]);
    });
  });

  describe('deleteUser', () => {
    it('should DELETE correct endpoint', () => {
      service.deleteUser('1').subscribe();
      const req = http.expectOne(`${API_URL}/admin/users/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('updateRole', () => {
    it('should PATCH with new role', () => {
      service.updateRole('1', Role.ADMIN).subscribe();
      const req = http.expectOne(`${API_URL}/admin/users/1/role`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ role: Role.ADMIN });
      req.flush({});
    });

    it('should PATCH correct user id', () => {
      service.updateRole('42', Role.USER).subscribe();
      const req = http.expectOne(`${API_URL}/admin/users/42/role`);
      req.flush({});
    });
  });
});