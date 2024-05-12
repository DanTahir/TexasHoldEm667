import { db } from "@backend/db/connection.js";

export type User = {
  username: string;
  email: string;
  password: string;
  balance: number;
  profile_image?: string;
};

export async function createUser(user: Omit<User, "balance">) {
  await db.none(
    "INSERT INTO users(username, email, password) VALUES ($1, $2, $3)",
    [user.username, user.email, user.password],
  );
}

export async function readUserFromID(id: string) {
  const user: User = await db.one("SELECT * FROM users WHERE id = $1", [id]);

  return user;
}

export async function readUserFromUsername(username: string) {
  const user: User | null = await db.oneOrNone(
    "SELECT * FROM users WHERE username = $1",
    [username],
  );

  return user;
}

export async function updateUserBalance(username: string, balance: number) {
  const user = await readUserFromUsername(username);

  if (!user) {
    throw new Error("User doesn't exist.");
  }

  await db.none("UPDATE users SET balance = $1 WHERE username = $2", [
    balance,
    username,
  ]);
}

export async function addToUserBalance(username: string, amount: number) {
  await db.none("UPDATE users SET balance = balance + $1 WHERE username = $2", [
    amount,
    username,
  ]);
}

export async function updateProfileImage(
  username: string,
  newProfileImage: string,
) {
  await db.none("UPDATE users SET profile_image = $1 WHERE username = $2", [
    newProfileImage,
    username,
  ]);
}

export async function deleteUser(username: string) {
  await db.none("DELETE FROM users WHERE username = $1", [username]);
}
