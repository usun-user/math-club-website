import { withSupabase } from "npm:@supabase/server@1";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INTEGER_PATTERN = /^[+-]?\d{1,100}$/;

function normalizeInteger(value: string): string | null {
  const text = value.trim();
  if (!INTEGER_PATTERN.test(text)) return null;
  try {
    return BigInt(text).toString();
  } catch {
    return null;
  }
}

function respond(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

export default {
  fetch: withSupabase({ auth: "publishable" }, async (request, ctx) => {
    if (request.method !== "POST") return respond({ error: "Method not allowed" }, 405);

    let input: unknown;
    try {
      input = await request.json();
    } catch {
      return respond({ error: "Invalid JSON" }, 400);
    }

    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return respond({ error: "Invalid submission" }, 400);
    }

    const { problemId, answer } = input as Record<string, unknown>;

    if (typeof problemId !== "string" || !UUID_PATTERN.test(problemId) ||
        typeof answer !== "string" || answer.length > 100) {
      return respond({ error: "Invalid problem ID or answer" }, 400);
    }

    // Identify the user using a verified Supabase session.
    const authorization = request.headers.get("Authorization");
    let userId: string | null = null;

    if (authorization?.startsWith("Bearer ")) {
      const token = authorization.slice(7);
      const { data, error } = await ctx.supabaseAdmin.auth.getUser(token);

      if (error || !data.user) {
        return respond({ error: "Invalid session" }, 401);
      }

      userId = data.user.id;
    }

    const { data: problem, error: problemError } = await ctx.supabaseAdmin
      .from("problems")
      .select("id, answer_type, weekly_sets!inner(is_published)")
      .eq("id", problemId)
      .eq("weekly_sets.is_published", true)
      .maybeSingle();

    if (problemError) return respond({ error: "Unable to load problem" }, 500);
    if (!problem) return respond({ error: "Problem not found" }, 404);
    if (problem.answer_type !== "number") {
      return respond({ error: "This answer type requires another grader" }, 422);
    }

    const submitted = normalizeInteger(answer);
    if (submitted === null) return respond({ error: "Enter a valid integer" }, 400);

    const { data: keyRow, error: keyError } = await ctx.supabaseAdmin
      .from("answer_keys")
      .select("answer_data")
      .eq("problem_id", problemId)
      .maybeSingle();

    if (keyError || !keyRow) return respond({ error: "Answer checking unavailable" }, 503);

    const key = keyRow.answer_data;
    if (!key || key.type !== "integer" || typeof key.value !== "string") {
      return respond({ error: "Invalid answer key configuration" }, 503);
    }

    const correct = normalizeInteger(key.value);
    if (correct === null) return respond({ error: "Invalid answer key" }, 503);

    if (submitted !== correct) {
      return respond({
        status: "incorrect",
        feedback: "Incorrect. Try again!",
        pointsAwarded: 0
      });
    }

    if (!userId) {
      return respond({
        status: "correct",
        feedback: "Correct! Log in to save future progress.",
        pointsAwarded: 0
      });
    }

    const { data: awarded, error: awardError } = await ctx.supabaseAdmin.rpc(
      "award_problem_xp",
      { p_user_id: userId, p_problem_id: problemId }
    );

    if (awardError) {
      console.error("XP transaction failed", awardError);
      return respond({ error: "Unable to save completion. Please retry." }, 503);
    }

    const pointsAwarded = Number(awarded);

    return respond({
      status: "correct",
      feedback: pointsAwarded > 0
        ? `Correct! You earned ${pointsAwarded} XP!`
        : "Correct! You've already completed this problem.",
      pointsAwarded
    });
  })
};