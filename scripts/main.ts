import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sample = await prisma.required.create({
    data: {
      requiredDate: new Date(),
      requiredDateTime: new Date(),
    },
  });
  const sample2 = await prisma.required.create({
    data: {
      requiredDate: "2023-03-20T00:00:00+09:00",
      requiredDateTime: "2023-03-20T23:18:00+09:00",
    },
  });
  console.log({ sample, sample2 });
}

main();
