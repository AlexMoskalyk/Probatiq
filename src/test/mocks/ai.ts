import { vi } from "vitest";

export const generateAiQuestionMock = vi.fn();
export const generateAiQuestionFeedbackMock = vi.fn();
export const generateAiInterviewFeedbackMock = vi.fn();
export const analyzeResumeForJobMock = vi.fn();

function fakeTextStreamResponse(text = "stubbed-stream") {
  return {
    toTextStreamResponse: () =>
      new Response(text, { headers: { "content-type": "text/plain" } }),
    text: Promise.resolve(text),
  };
}

function fakeObjectStreamResponse(value: unknown = { ok: true }) {
  return {
    toTextStreamResponse: () =>
      new Response(JSON.stringify(value), {
        headers: { "content-type": "application/json" },
      }),
    object: Promise.resolve(value),
  };
}

generateAiQuestionMock.mockImplementation(() =>
  fakeTextStreamResponse("question"),
);
generateAiQuestionFeedbackMock.mockImplementation(() =>
  fakeTextStreamResponse("feedback"),
);
generateAiInterviewFeedbackMock.mockResolvedValue("interview feedback");
analyzeResumeForJobMock.mockImplementation(async () =>
  fakeObjectStreamResponse({ overallScore: 7 }),
);

vi.mock("@/src/services/ai/questions", () => ({
  generateAiQuestion: generateAiQuestionMock,
  generateAiQuestionFeedback: generateAiQuestionFeedbackMock,
}));

vi.mock("@/src/services/ai/interviews", () => ({
  generateAiInterviewFeedback: generateAiInterviewFeedbackMock,
}));

vi.mock("@/src/services/ai/resumes/ai", () => ({
  analyzeResumeForJob: analyzeResumeForJobMock,
}));

export { fakeTextStreamResponse, fakeObjectStreamResponse };
