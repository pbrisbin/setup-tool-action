import { interpolate } from "./interpolate";

describe("interpolate", () => {
  test("leaves unused alone", () => {
    const input = "https://example.com/{name}/{value}/{unused}";
    const expected = "https://example.com/my-name/my-value/{unused}";
    const actual = interpolate(input, { name: "my-name", value: "my-value" });
    expect(actual).toEqual(expected);
  });

  test("is whitespace insensitive", () => {
    const input = "https://example.com/{ name}/{value  }/{unused}";
    const expected = "https://example.com/my-name/my-value/{unused}";
    const actual = interpolate(input, { name: "my-name", value: "my-value" });
    expect(actual).toEqual(expected);
  });

  test("avoids unsafe interpolations", () => {
    const input = "Can I ${this}?";
    const actual = interpolate(input, {});
    expect(actual).toEqual(input);
  });
});
