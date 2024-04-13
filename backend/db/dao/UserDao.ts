import db from "../connection";
import signale from "signale";

interface User {
  username: string;
  email: string;
  password: string;
  balance?: number;
  profile_image?: string;
}

//TODO: Promise<Boolean> fn for checking if user exists already in DB.
//TODO: Delete, Update fn's need to be added

async function createUser(user: User): Promise<boolean> | never {
  try {
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

async function readUser(username?: string, id?: string): Promise<User> | never {
  try {
    if (!username && !id) {
      throw new Error("No Parameters to query with.");
    }
    const user = await db.one(
      "SELECT * FROM users WHERE username = $1 OR id = $2",
      [username || null, id || null],
    );

    return user;
  } catch (error) {
    throw error;
  }
}
