import { prisma } from "../prisma";

describe("prisma default behavior", () => {
  describe("DATETIME型のカラムの場合", () => {
    it("登録するときに、UTCに変換されて登録されること", () => {});

    it("取得するときに、UTCからJSTに変換されること", () => {});

    it("検索するとき、UTCに変換されること", () => {});
  });

  describe("DATE型のカラムの場合", () => {
    it("登録するときに、UTCに変換されて登録されること", () => {});

    it("取得するときに、UTCからJSTに変換されること", () => {});

    it("検索するとき、UTCに変換されること", () => {});
  });
});
