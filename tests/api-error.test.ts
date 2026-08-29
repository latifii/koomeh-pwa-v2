import assert from "node:assert/strict";
import { test } from "vitest";
import axios from "axios";
import { z } from "zod";

import { ApiError, normalizeApiError } from "@/lib/api/api-error";

/**
 * `normalizeApiError` recognises axios and Zod errors structurally rather than
 * with `instanceof`, so that importing it does not pull either library into the
 * client bundle — it is reached from the query provider in the root layout, so
 * anything it imports is downloaded by every visitor.
 *
 * The trade is that a shape change in either library would go unnoticed. These
 * tests build the errors with the real libraries, so if that ever happens it
 * fails here rather than in production as a wrong error message.
 */

test("a real ZodError is still classified as a validation failure", () => {
  const schema = z.object({ id: z.number() });
  const result = schema.safeParse({ id: "not a number" });
  assert.equal(result.success, false);

  const normalized = normalizeApiError(result.error);

  assert.equal(normalized.code, "INVALID_RESPONSE");
  assert.equal(normalized.userMessage, "پاسخ دریافتی از سرویس معتبر نیست.");
});

test("a real axios response error keeps its status and retryability", () => {
  const error = new axios.AxiosError(
    "Request failed with status code 503",
    "ERR_BAD_RESPONSE",
    undefined,
    undefined,
    {
      status: 503,
      statusText: "Service Unavailable",
      data: {},
      headers: {},
      config: { headers: {} },
    } as never,
  );

  const normalized = normalizeApiError(error);

  assert.equal(normalized.status, 503);
  assert.equal(normalized.code, "SERVER_ERROR");
  assert.equal(normalized.retryable, true);
});

test("a real axios timeout is a timeout, not a generic failure", () => {
  const error = new axios.AxiosError("timeout", "ECONNABORTED");

  const normalized = normalizeApiError(error);

  assert.equal(normalized.code, "TIMEOUT");
  assert.equal(normalized.retryable, true);
});

test("an axios error with no response reads as a network failure", () => {
  const error = new axios.AxiosError("Network Error", "ERR_NETWORK");

  const normalized = normalizeApiError(error);

  assert.equal(normalized.code, "NETWORK_ERROR");
  assert.equal(normalized.retryable, true);
});

test("a cancelled request is recognised and is not retryable", () => {
  const normalized = normalizeApiError(new axios.CanceledError("canceled"));

  assert.equal(normalized.code, "REQUEST_CANCELLED");
  assert.equal(normalized.retryable, false);
});

test("an ApiError passes through untouched", () => {
  const original = new ApiError("already normalized", {
    code: "NOT_FOUND",
    userMessage: "پیدا نشد.",
  });

  assert.equal(normalizeApiError(original), original);
});

test("anything else falls back to the unknown case", () => {
  const normalized = normalizeApiError(new Error("something odd"));

  assert.equal(normalized.code, "UNKNOWN_ERROR");
});
