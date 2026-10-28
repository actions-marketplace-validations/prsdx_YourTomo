import test from "node:test";
import assert from "node:assert/strict";
import {
  applyForceState,
  currentStreak,
  decide,
} from "../src/state.ts";

test("currentStreak ignores an incomplete zero-count day", () => {
  assert.equal(
    currentStreak([
      { date: "2026-10-13", count: 2 },
      { date: "2026-10-14", count: 1 },
      { date: "2026-10-15", count: 0 },
    ]),
    2,
  );
});

test("applyForceState only accepts known states", () => {
  const original = { state: "content", caption: "ok", apiOk: true };
  assert.equal(applyForceState(original, "sleeping").state, "sleeping");
  assert.deepEqual(applyForceState(original, "unknown"), original);
});

test("a failed watched CI run takes priority over activity", () => {
  const status = decide(
    [{ type: "PushEvent", created_at: "2026-10-15T10:00:00Z" }],
    {},
    { failed: true, repo: "demo", runNumber: 42 },
    new Date("2026-10-15T12:00:00Z"),
  );
  assert.equal(status.state, "overheat");
  assert.match(status.caption, /demo.*42/);
});
