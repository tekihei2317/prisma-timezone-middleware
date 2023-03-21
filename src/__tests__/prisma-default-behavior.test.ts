import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Connection, createConnection } from "../mysql-client";
import { prisma } from "../prisma";

describe("prisma default behavior", () => {
  let connection!: Connection;

  beforeAll(async () => {
    connection = await createConnection({ dateStrings: true });
  });

  afterEach(async () => {
    await connection.query("delete from Required");
  });

  afterAll(async () => {
    connection.end();
  });

  describe("DATETIME型のカラムの場合", () => {
    test("登録するときに、UTCに変換されて登録されること", async () => {
      const result = await prisma.required.create({
        data: {
          requiredDate: new Date("2023-03-21T08:00:00+09:00"),
          requiredDateTime: new Date("2023-03-21T09:30+09:00"),
        },
      });

      const [rows] = await connection.query<RowDataPacket[]>(
        "select * from Required where id = ?",
        [result.id]
      );

      expect(rows[0].requiredDateTime).toBe("2023-03-21 00:30:00.000");
    });

    test("取得するときに、データベースの日時はUTCとして解釈されること", async () => {
      const [result] = await connection.query<ResultSetHeader>(
        "insert into Required (requiredDate, requiredDateTime) values (?, ?)",
        ["2023-03-21", "2023-03-21 00:30:00.000"]
      );

      const record = await prisma.required.findUniqueOrThrow({
        where: { id: result.insertId },
      });
      expect(record.requiredDateTime.toISOString()).toBe(
        "2023-03-21T00:30:00.000Z"
      );
    });

    test("検索するとき、引数はUTCの時刻として扱われること", async () => {
      const [result] = await connection.query<ResultSetHeader>(
        "insert into Required (requiredDate, requiredDateTime) values ?",
        [
          [
            ["2023-03-21", "2023-03-21 00:30:00.000"],
            ["2023-03-21", "2023-03-21 00:31:00.000"],
          ],
        ]
      );

      const records = await prisma.required.findMany({
        where: {
          requiredDateTime: {
            gt: new Date("2023-03-21T09:30:00+09:00"),
          },
        },
      });
      expect(records.length).toBe(1);
      expect(records[0].id).toBe(result.insertId + 1);
    });
  });

  describe("DATE型のカラムの場合", () => {
    const dateTime = new Date("2023-03-21T00:00:00Z");
    const eightOclock = new Date("2023-03-21T08:00:00+09:00");
    const nineOclock = new Date("2023-03-21T09:00:00+09:00");

    test("登録するときに、UTCに変換されて登録されること", async () => {
      await prisma.required.createMany({
        data: [
          { requiredDate: eightOclock, requiredDateTime: dateTime },
          { requiredDate: nineOclock, requiredDateTime: dateTime },
        ],
      });

      const [rows] = await connection.query<RowDataPacket[]>(
        "select * from Required"
      );
      expect(rows[0].requiredDate).toBe("2023-03-20");
      expect(rows[1].requiredDate).toBe("2023-03-21");
    });

    test("取得するときに、データベースの日付はUTCとして解釈されること", async () => {
      const [result] = await connection.query<ResultSetHeader>(
        "insert into Required (requiredDate, requiredDateTime) values (?, ?)",
        ["2023-03-21", "2023-03-21 00:30:00.000"]
      );

      const record = await prisma.required.findUniqueOrThrow({
        where: { id: result.insertId },
      });
      expect(record.requiredDate.toISOString()).toBe(
        "2023-03-21T00:00:00.000Z"
      );
    });

    test("検索するとき、引数はUTCの時刻として使われること", async () => {
      await connection.query<ResultSetHeader>(
        "insert into Required (requiredDate, requiredDateTime) values ?",
        [
          [
            ["2023-03-20", "2023-03-21 00:30:00.000"],
            ["2023-03-21", "2023-03-21 00:30:00.000"],
          ],
        ]
      );

      expect(
        await prisma.required.count({
          where: { requiredDate: { gte: new Date("2023-03-20T00:00:00Z") } },
        })
      ).toBe(2);

      expect(
        await prisma.required.count({
          where: { requiredDate: { gte: new Date("2023-03-21T00:00:00Z") } },
        })
      ).toBe(1);
    });
  });
});
