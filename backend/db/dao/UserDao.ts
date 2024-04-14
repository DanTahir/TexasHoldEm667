import db from "../connection";
import signale from "signale";

interface User {
  username: string;
  email: string;
  password: string;
  balance: number;
  profile_image?: string;
}

async function createUser(user: User): Promise<boolean> | never {
  try {
    if (await readUser(user.username)) {
      throw new Error("User already exists.");
    }
    await db.none(
      "INSERT INTO users(username, email, password) VALUES ($1, $2, $3)",
      [user.username, user.password, user.email],
    );

    signale.success("User created successfully!");

    return true;
  } catch (error) {
    throw error;
  }
}

async function readUserFromID(id: string): Promise<User> | null {
  try {
    const user = await db.one("SELECT * FROM users WHERE id = $1", [id]);

    return user;
  } catch (error) {
    throw error;
  }
}

async function readUserFromUsername(username: string): Promise<User> | null {
  try {
    const user = await db.one("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    return user;
  } catch (error) {
    throw error;
  }
}

async function updateUserBalance(
  username: string,
  depositAmount: number,
): Promise<Boolean> | never {
  try {
    const user = await readUser(username);

    if (!user) {
      throw new Error("User doesn't exist.");
    }

    await db.none("UPDATE users SET balance = $1 WHERE username = $2", [
      user.balance + depositAmount,
      username,
    ]);

    return true;
  } catch (error) {
    throw error;
  }
}

async function updateProfileImage(
  username: string,
  newProfileImage: string,
): Promise<boolean> | never {
  try {
    const user = await readUser(username);

    if (!user) {
      throw new Error("User doesn't exist");
    }

    await db.none("UPDATE users SET profile_image = $1 WHERE username = $2", [
      newProfileImage,
      username,
    ]);

    return true;
  } catch (error) {
    throw error;
  }
}

async function deleteUser(username: string): Promise<boolean> | never {
  try {
    const user = await readUser(username);

    if (!user) {
      throw new Error("User doesn't exist");
    }

    await db.none("DELETE FROM users WHERE username = $1", [username]);

    return true;
  } catch (error) {
    throw error;
  }
}
