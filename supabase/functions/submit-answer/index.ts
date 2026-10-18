import { withSupabase } from "npm:@supabase/server@1";

type AnswerKey = {
  type: "integer";
  value: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const INTEGER_PATTERN = /^[+-]?\d{1,100}$/;

function normalizeInteger(value: string): string | null {
  const trimmed = value.trim();

  if (!INTEGER_PATTERN.test(trimmed)) {
    return null;
  }

  try {
    return BigInt(trimmed).toString();
  } catch {
    return null;
  }
}

function jsonResponse(
  body: unknown,
  status = 200,
): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export default {
  fetch: withSupabase(
    { auth: "publishable" },
    async (request, ctx) => {
      if (request.method !== "POST") {
        return jsonResponse(
          { error: "Method not allowed" },
          405,
        );
      }

      let body: unknown;

      try {
        body = await request.json();
      } catch {
        return jsonResponse(
          { error: "Invalid JSON" },
          400,
        );
      }

      if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
      ) {
        return jsonResponse(
          { error: "Invalid submission" },
          400,
        );
      }

      const input = body as Record<string, unknown>;

      if (
        typeof input.problemId !== "string" ||
        !UUID_PATTERN.test(input.problemId) ||
        typeof input.answer !== "string" ||
        input.answer.length > 100
      ) {
        return jsonResponse(
          { error: "Invalid problem ID or answer" },
          400,
        );
      }

      // Only published problems can be answered.
      const { data: problem, error: problemError } =
        await ctx.supabase
          .from("problems")
          .select(
            "id, answer_type, weekly_sets!inner(is_published)",
          )
          .eq("id", input.problemId)
          .eq("weekly_sets.is_published", true)
          .maybeSingle();

      if (problemError) {
        console.error("Problem lookup failed");
        return jsonResponse(
          { error: "Unable to check answer" },
          500,
        );
      }

      if (!problem) {
        return jsonResponse(
          { error: "Problem not found" },
          404,
        );
      }

      if (problem.answer_type !== "number") {
        return jsonResponse(
          { error: "This answer type is not supported yet" },
          422,
        );
      }

      const normalizedAnswer =
        normalizeInteger(input.answer);

      if (normalizedAnswer === null) {
        return jsonResponse(
          { error: "Enter a valid integer" },
          400,
        );
      }

      // Privileged access is used only on the server.
      const { data: keyRow, error: keyError } =
        await ctx.supabaseAdmin
          .from("answer_keys")
          .select("answer_data")
          .eq("problem_id", input.problemId)
          .maybeSingle();

      if (keyError || !keyRow) {
        console.error("Answer key unavailable");
        return jsonResponse(
          { error: "Answer checking unavailable" },
          503,
        );
      }

      const key = keyRow.answer_data as AnswerKey;

      if (
        key?.type !== "integer" ||
        typeof key.value !== "string"
      ) {
        console.error("Invalid answer key configuration");
        return jsonResponse(
          { error: "Answer checking unavailable" },
          503,
        );
      }

      const correctValue = normalizeInteger(key.value);

      if (correctValue === null) {
        return jsonResponse(
          { error: "Answer checking unavailable" },
          503,
        );
      }

      const isCorrect = normalizedAnswer === correctValue;

      return jsonResponse({
        status: isCorrect ? "correct" : "incorrect",
        feedback: isCorrect
          ? "Correct! Great work!"
          : "Incorrect. Try again!",
        pointsAwarded: 0,
      });
    },
  ),
};