import { eq } from 'drizzle-orm';
import db from '~/db';
import { NewUser, usersTable } from '~/db/schemas/users';

class UserService {
  async userExists(email: string) {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    return result.length > 0;
  }

  async getUserByEmail(email: string) {
    try {
      const result = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));

      return result[0] || null;
    } catch {
      throw new Error('Could not fetch user');
    }
  }

  async createUser(user: NewUser): Promise<{ id: number }[]> {
    return await db.insert(usersTable).values(user).$returningId();
  }
}

export default UserService;
