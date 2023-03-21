import mysql from "mysql2/promise";

export async function createConnection(option?: { dateStrings: boolean }) {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "dev",
    password: "secret",
    timezone: "+09:00",
    dateStrings: option?.dateStrings,
  });
  return connection;
}

export type Connection = Awaited<ReturnType<typeof createConnection>>;
