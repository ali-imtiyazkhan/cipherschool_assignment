import { UserRepository } from "../repositories/UserRepository";
import { User } from "../entities/User";

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getOrCreate(name: string): Promise<User> {
    return this.userRepo.getOrCreate(name);
  }
}