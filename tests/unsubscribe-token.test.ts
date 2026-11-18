import { describe, expect, it } from "vitest";
import { createUnsubscribeToken, verifyUnsubscribeToken } from "@/lib/email/unsubscribe-token";

const SECRET = "test-secret-0123456789abcdef0123456789";
const USER_ID = "65a1b2c3d4e5f60718293a4b";

describe("unsubscribe tokens", () => {
  it("round-trips the user id and the list", () => {
    const token = createUnsubscribeToken(USER_ID, "digest", SECRET);
    expect(verifyUnsubscribeToken(token, SECRET)).toEqual({ userId: USER_ID, list: "digest" });
  });

  it("is URL-safe", () => {
    expect(createUnsubscribeToken(USER_ID, "digest", SECRET)).toMatch(/^[\w-]+\.[\w-]+$/);
  });

  it("rejects a token signed with another secret", () => {
    const token = createUnsubscribeToken(USER_ID, "digest", "another-secret-0123456789abcdef");
    expect(verifyUnsubscribeToken(token, SECRET)).toBeNull();
  });

  it("rejects a token whose user id was swapped", () => {
    const [, signature] = createUnsubscribeToken(USER_ID, "digest", SECRET).split(".");
    const forgedPayload = Buffer.from("digest:someone-else").toString("base64url");
    expect(verifyUnsubscribeToken(`${forgedPayload}.${signature}`, SECRET)).toBeNull();
  });

  it.each([
    ["null", null],
    ["an empty string", ""],
    ["no signature", "ZGlnZXN0OnU"],
    ["three parts", "a.b.c"],
    ["garbage", "not a token"],
    ["a 600-character string", "a".repeat(600)],
  ])("rejects %s", (_label, token) => {
    expect(verifyUnsubscribeToken(token, SECRET)).toBeNull();
  });

  it("refuses to sign or verify without a secret", () => {
    expect(() => createUnsubscribeToken(USER_ID, "digest", "")).toThrow(/BETTER_AUTH_SECRET/);
  });
});
