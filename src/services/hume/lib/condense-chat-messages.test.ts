import { describe, it, expect } from "vitest";
import { condenseChatMessages } from "./condense-chat-messages";

const u = (content: string) => ({
  type: "user_message",
  message: { content },
}) as never;

const a = (content: string) => ({
  type: "assistant_message",
  message: { content },
}) as never;

const U = (messageText: string) => ({
  type: "USER_MESSAGE",
  messageText,
}) as never;

const A = (messageText: string) => ({
  type: "AGENT_MESSAGE",
  messageText,
}) as never;

describe("condenseChatMessages", () => {
  it("returns empty for empty input", () => {
    expect(condenseChatMessages([])).toEqual([]);
  });

  it("ignores unsupported message types", () => {
    expect(
      condenseChatMessages([{ type: "session_started" } as never]),
    ).toEqual([]);
  });

  it("groups consecutive same-speaker messages", () => {
    const result = condenseChatMessages([u("hi"), u("there"), a("hello")]);
    expect(result).toEqual([
      { isUser: true, content: ["hi", "there"] },
      { isUser: false, content: ["hello"] },
    ]);
  });

  it("alternates groups on speaker change", () => {
    const result = condenseChatMessages([u("a"), a("b"), u("c")]);
    expect(result).toEqual([
      { isUser: true, content: ["a"] },
      { isUser: false, content: ["b"] },
      { isUser: true, content: ["c"] },
    ]);
  });

  it("handles chat-event (uppercase) variants", () => {
    const result = condenseChatMessages([U("q1"), A("a1"), A("a2")]);
    expect(result).toEqual([
      { isUser: true, content: ["q1"] },
      { isUser: false, content: ["a1", "a2"] },
    ]);
  });

  it("drops messages with null content", () => {
    const result = condenseChatMessages([
      u("kept"),
      { type: "user_message", message: { content: null } } as never,
      u("kept2"),
    ]);
    expect(result).toEqual([{ isUser: true, content: ["kept", "kept2"] }]);
  });
});
