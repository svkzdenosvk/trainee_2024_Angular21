export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface UserWithStats extends User {
  favouritesCount: number;
}