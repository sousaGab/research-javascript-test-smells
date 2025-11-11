import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { server } from "../src/server.js";

const host = process.env.HOST || "localhost";
const port = process.env.PORT || 3000;

const EXPECTED_PING_RESPONSE = { message: "pong" };
const EXPECTED_HEALTH_RESPONSE = { status: "ok" };
const HTTP_OK_STATUS = 200;
const HTTP_NOT_FOUND = 404;

describe("Server", () => {
  beforeAll(async () => {
    await server.listen({ host, port });
  });

  afterAll(async () => {
    await server.close();
  });

  const injectRequest = async (url) => {
    return await server.inject({
      method: "GET",
      url,
    });
  };

  const assertResponse = (response, expectedResponse) => {
    expect(response.statusCode).toBe(HTTP_OK_STATUS);
    expect(response.json()).toEqual(expectedResponse);
  };

  it("should return pong for GET /ping", async () => {
    const response = await injectRequest("/ping");
    assertResponse(response, EXPECTED_PING_RESPONSE);
  });

  it("should return ok for GET /health", async () => {
    const response = await injectRequest("/health");
    assertResponse(response, EXPECTED_HEALTH_RESPONSE);
  });

  it("should return 404 for an unknown route", async () => {
    const response = await injectRequest("/unknown-route");
    expect(response.statusCode).toBe(HTTP_NOT_FOUND);
  });
});
