import { Prisma } from "@prisma/client";

function setOffsetTime(object: any, offsetTime: number) {
  if (typeof object !== "object") return;

  for (const key of Object.keys(object)) {
    const value = object[key];
    if (value instanceof Date) {
      object[key] = new Date(value.getTime() + offsetTime);
    } else if (typeof value === "object") {
      setOffsetTime(value, offsetTime);
    }
  }
}

export const timezoneMiddleware: Prisma.Middleware = async (params, next) => {
  const offsetTime = 9 * 60 * 60 * 1000;

  setOffsetTime(params.args, offsetTime);
  const result = await next(params);
  setOffsetTime(result, -offsetTime);

  return result;
};
