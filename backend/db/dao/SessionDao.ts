import db from "../connection";
import signale from "signale";

interface Session {
  user_id: string;
  cookie: string;
}

async function createSession(session: Session): Promise<boolean> | never {
  try {
    await db.none("INSERT INTO sessions(user_id, cookie) VALUES ($1, $2)", [
      session.user_id,
      session.cookie,
    ]);

    signale.success("Session created successfully!");

    return true;
  } catch (error) {
    throw error;
  }
}

async function getSession(user_id: string): Promise<Session> | never {
  try {
    const session = await db.one("SELECT * FROM sessions WHERE user_id = $1", [
      user_id,
    ]);

    return session;
  } catch (error) {
    throw error;
  }
}

async function updateSession(
  user_id: string,
  newCookie: string,
): Promise<boolean> | never {
  try {
    const session = await getSession(user_id);

    if (!session) {
      throw new Error("Session doesn't exist");
    }

    await db.none("UPDATE sessions SET cookie = $1 WHERE user_id = $2", [
      newCookie,
      user_id,
    ]);

    return true;
  } catch (error) {
    throw error;
  }
}

async function deleteSession(user_id: string): Promise<boolean> | never {
  try {
    await getSession(user_id);

    await db.none("DELETE FROM sessions WHERE user_id = $1", [user_id]);

    return true;
  } catch (error) {
    throw error;
  }
}
