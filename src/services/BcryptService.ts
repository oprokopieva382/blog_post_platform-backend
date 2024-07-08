import bcrypt from "bcrypt";
import { injectable } from "inversify";

@injectable()
export class BcryptService {
  async createHash(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async testPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}

