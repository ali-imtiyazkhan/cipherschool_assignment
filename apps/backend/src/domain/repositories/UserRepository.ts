import { User } from "../entities/User";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(name: string): Promise<User>;
  getOrCreate(name: string): Promise<User>;
}