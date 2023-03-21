import { Connection, createConnection } from "../mysql-client";

type RowDataPacketConstructor = {
  constructor: {
    name: "RowDataPacket";
  };
};

type Sample = RowDataPacketConstructor & {
  date: Date;
  updatedAt: Date;
};

describe("MySQL Client", () => {
  let connection!: Connection;

  beforeAll(async () => {
    connection = await createConnection();
  });

  // https://github.com/sidorares/node-mysql2/issues/384
  beforeEach(async () => {
    await connection.query("start transaction;");
  });

  afterEach(async () => {
    await connection.query("rollback;");
  });

  afterAll(async () => {
    await connection.end();
  });

  test("データを登録できること", async () => {
    await connection.query(
      "insert into Sample (updatedAt) values ('2023-03-21 11:23:00');"
    );
  });

  test("データを取得できること", async () => {
    await connection.query(
      "insert into Sample (updatedAt) values ('2023-03-21 11:23:00');"
    );

    const [rows] = await connection.query<Sample[]>(
      "select createdAt, updatedAt from Sample"
    );

    expect(rows.length).toBe(1);
  });

  test("他のテストケースのデータは削除されていること", async () => {
    const [rows] = await connection.query<Sample[]>(
      "select createdAt, updatedAt from Sample"
    );

    expect(rows.length).toBe(0);
  });

  test("DATETIME型は、指定したタイムゾーン（JST）の日時として解釈されること", async () => {
    await connection.query(
      "insert into Sample (updatedAt) values ('2023-03-21 11:23:00');"
    );

    const [rows] = await connection.query<Sample[]>(
      "select createdAt, updatedAt from Sample"
    );

    expect(rows[0].updatedAt).toStrictEqual(
      new Date("2023-03-21T11:23:00+09:00")
    );
  });

  test("DATE型は、指定したタイムゾーンの日付として解釈されること", async () => {
    await connection.query(
      "insert into Sample (date, updatedAt) values ('2023-03-21', '2023-03-21 11:23:00');"
    );
    const [rows] = await connection.query<Sample[]>(
      "select date, updatedAt from Sample"
    );

    expect(rows[0].date).toStrictEqual(new Date("2023-03-21T00:00:00+09:00"));
  });
});
