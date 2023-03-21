import mysql from "mysql2/promise";

export async function createConnection() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "dev",
    password: "secret",
    timezone: "+09:00",
  });
  return connection;
}

export type Connection = Awaited<ReturnType<typeof createConnection>>;
