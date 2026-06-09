import { Role } from './role.enum';

// Application user model representing authenticated user data.
export interface User {
  id: string;
  username: string;
  role: Role;
}

// Extended user model with admin dashboard statistics.
export interface UserWithStats extends User {
  favouritesCount: number;
}
