import db from "../connection";
import signale from "signale";

interface User {
  username: string;
  email: string;
  password: string;
}

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
