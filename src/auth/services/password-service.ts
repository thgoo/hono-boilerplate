import { sha1 } from '@oslojs/crypto/sha1';
import { encodeHexLowerCase } from '@oslojs/encoding';

class PasswordService {
  async hashPassword(password: string): Promise<string> {
    return Bun.password.hash(password);
  }

  async verifyPasswordHash(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return Bun.password.verify(password, hash);
  }

  async verifyPasswordStrength(
    password: string,
  ): Promise<boolean> {
    if (password.length < 8 || password.length > 255) {
      return false;
    }
    const hash = encodeHexLowerCase(sha1(new TextEncoder().encode(password)));
    const hashPrefix = hash.slice(0, 5);
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${hashPrefix}`,
    );
    const data = await response.text();
    const items = data.split('\n');
    for (const item of items) {
      const hashSuffix = item.slice(0, 35).toLowerCase();
      if (hash === hashPrefix + hashSuffix) {
        return false;
      }
    }
    return true;
  }
}

export default PasswordService;
