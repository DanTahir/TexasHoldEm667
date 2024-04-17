import signale from "signale";
import { db } from "@backend/db/connection";

interface User {
  username: string;
  email: string;
  password: string;
  balance: number;
  profile_image?: string;
}

export async function createUser(user: User): Promise<boolean | null> {
  if (await readUserFromUsername(user.username)) {
    throw new Error("User already exists.");
  }
  await db.none(
    "INSERT INTO users(username, email, password) VALUES ($1, $2, $3)",
    [user.username, user.password, user.email],
  );

  signale.success("User created successfully!");

  return true;
}

export async function readUserFromID(id: string): Promise<User | null> {
  const user = await db.one("SELECT * FROM users WHERE id = $1", [id]);

  return user;
}

export async function readUserFromUsername(
  username: string,
): Promise<User | null> {
  const user = await db.one("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  return user;
}

export async function updateUserBalance(
  username: string,
  depositAmount: number,
): Promise<void> {
  const user = await readUserFromUsername(username);

  if (!user) {
    throw new Error("User doesn't exist.");
  }

  await db.none("UPDATE users SET balance = $1 WHERE username = $2", [
    user.balance + depositAmount,
    username,
  ]);
}

export async function updateProfileImage(
  username: string,
  newProfileImage: string,
): Promise<void> {
  const user = await readUserFromUsername(username);

  if (!user) {
    throw new Error("User doesn't exist");
  }

  await db.none("UPDATE users SET profile_image = $1 WHERE username = $2", [
    newProfileImage,
    username,
  ]);
}

export async function deleteUser(username: string): Promise<boolean | null> {
  const user = await readUserFromUsername(username);

  if (!user) {
    throw new Error("User doesn't exist");
  }

  await db.none("DELETE FROM users WHERE username = $1", [username]);

  return true;
}
