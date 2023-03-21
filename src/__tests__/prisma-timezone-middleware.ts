import { RowDataPacket } from "mysql2";
import { Connection, createConnection } from "../mysql-client";
import { prisma } from "../prisma";
import { timezoneMiddleware } from "../prisma-timezone-middleware";

describe("prisma-timezone-middleware", () => {
  let connection!: Connection;

  beforeAll(async () => {
    connection = await createConnection({ dateStrings: true });
    prisma.$use(timezoneMiddleware);
  });

  afterEach(async () => {
    await connection.query("delete from Required");
  });

  afterAll(async () => {
    connection.end();
  });

  test("DATETIME型のカラムに保存するとき、JSTで保存されること", async () => {
    const date1 = new Date("2023-03-21T00:00:00Z");
    const date2 = new Date("2023-03-21T09:30:00+09:00");

    await prisma.required.createMany({
      data: [
        { requiredDate: date1, requiredDateTime: date1 },
        { requiredDate: date2, requiredDateTime: date2 },
      ],
    });
    await prisma.required.findFirst();
    await prisma.required.findMany();

    const [result] = await connection.query<RowDataPacket[]>(
      "select * from Required;"
    );

    expect(result[0].requiredDateTime).toBe("2023-03-21 09:00:00.000");
    expect(result[1].requiredDateTime).toBe("2023-03-21 09:30:00.000");
  });

  test("DATE型のカラムに保存するとき、JSTで保存されること", async () => {
    const date1 = new Date("2023-03-21T00:00:00Z");
    const date2 = new Date("2023-03-21T09:30:00+09:00");
    const date3 = new Date("2023-03-21T14:59:59Z");
    const date4 = new Date("2023-03-21T15:00:00Z");

    await prisma.required.createMany({
      data: [
        { requiredDate: date1, requiredDateTime: date1 },
        { requiredDate: date2, requiredDateTime: date2 },
        { requiredDate: date3, requiredDateTime: date3 },
        { requiredDate: date4, requiredDateTime: date4 },
      ],
    });
    await prisma.required.findFirst();
    await prisma.required.findMany();

    const [result] = await connection.query<RowDataPacket[]>(
      "select * from Required order by id;"
    );

    expect(result[0].requiredDate).toBe("2023-03-21");
    expect(result[1].requiredDate).toBe("2023-03-21");
    expect(result[2].requiredDate).toBe("2023-03-21");
    expect(result[3].requiredDate).toBe("2023-03-22");
  });

  test("データベースから日時を取得するとき、JSTとして解釈されること", async () => {
    await connection.query(
      "insert into Required (requiredDate, requiredDateTime) values (?, ?);",
      ["2023-03-21", "2023-03-21 10:00:00"]
    );

    const row = await prisma.required.findFirstOrThrow();

    expect(row.requiredDate.toISOString()).toBe("2023-03-20T15:00:00.000Z");
    expect(row.requiredDateTime.toISOString()).toBe("2023-03-21T01:00:00.000Z");
  });

  test("データベースのDATETIME型のカラムで検索するとき、引数がJSTの時刻として扱われること", async () => {
    await connection.query(
      "insert into Required (requiredDate, requiredDateTime) values (?, ?);",
      ["2023-03-21", "2023-03-21 10:00:00"]
    );

    expect(
      await prisma.required.count({
        where: { requiredDateTime: new Date("2023-03-21T10:00:00+09:00") },
      })
    ).toBe(1);
    expect(
      await prisma.required.count({
        where: { requiredDateTime: new Date("2023-03-21T09:59:59+09:00") },
      })
    ).toBe(0);
    expect(
      await prisma.required.count({
        where: { requiredDateTime: new Date("2023-03-21T10:00:01+09:00") },
      })
    ).toBe(0);
  });

  test("データベースのDATE型のカラムで検索するとき、引数がJSTの時刻として扱われること", async () => {
    await connection.query(
      "insert into Required (requiredDate, requiredDateTime) values (?, ?);",
      ["2023-03-21", "2023-03-21 10:00:00"]
    );

    expect(
      await prisma.required.count({
        where: { requiredDate: new Date("2023-03-21T00:00:00+09:00") },
      })
    ).toBe(1);
    expect(
      await prisma.required.count({
        where: { requiredDate: new Date("2023-03-20T23:59:59+09:00") },
      })
    ).toBe(0);
    expect(
      await prisma.required.count({
        where: { requiredDate: new Date("2023-03-21T00:00:01+09:00") },
      })
    ).toBe(0);
  });
});
