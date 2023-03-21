import { RowDataPacket } from "mysql2";
import { createConnection } from "../src/mysql-client";

async function main() {
  const connection = await createConnection();

  const [rows] = await connection.query<RowDataPacket[]>(
    "select createdAt, updatedAt from Sample"
  );
  console.log(rows[0]);

  await connection.end();
}

main();
