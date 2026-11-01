import { withSupabase } from "npm:@supabase/server@1";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function respond(body: unknown, status = 200) {
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
      return respond({ error: "Invalid request" }, 400);
    }

    const { problemId, action, guestCount } = input as Record<string, unknown>;

    if (typeof problemId !== "string" || !UUID_PATTERN.test(problemId) ||
        (action !== "status" && action !== "reveal")) {
      return respond({ error: "Invalid request" }, 400);
    }

    const authorization = request.headers.get("Authorization");
    let userId: string | null = null;

    if (authorization?.startsWith("Bearer ") && !authorization.slice(7).startsWith("sb_publishable_")) {
      const { data, error } = await ctx.supabaseAdmin.auth.getUser(
        authorization.slice(7)
      );

      if (error || !data.user) return respond({ error: "Invalid session" }, 401);
      userId = data.user.id;
    }

    const { data: problem } = await ctx.supabaseAdmin
      .from("problems")
      .select("id, weekly_sets!inner(is_published)")
      .eq("id", problemId)
      .eq("weekly_sets.is_published", true)
      .maybeSingle();

    if (!problem) return respond({ error: "Problem not found" }, 404);

    const { data: hints, error: hintsError } = await ctx.supabaseAdmin
      .from("hints")
      .select("id, hint_order, content, image_path")
      .eq("problem_id", problemId)
      .order("hint_order", { ascending: true });

    if (hintsError || !hints) return respond({ error: "Unable to load hints" }, 500);

    let revealed: number;
    let solved = false;

    if (userId) {
      const { data: progress, error: progressError } = await ctx.supabaseAdmin
        .from("problem_progress")
        .select("is_solved")
        .eq("user_id", userId)
        .eq("problem_id", problemId)
        .maybeSingle();

      if (progressError) return respond({ error: "Unable to load progress" }, 500);
      solved = progress?.is_solved === true;

      if (action === "reveal" && !solved) {
        const { data, error } = await ctx.supabaseAdmin.rpc(
          "advance_problem_hint",
          { p_user_id: userId, p_problem_id: problemId }
        );

        if (error) return respond({ error: "Unable to reveal hint" }, 500);
        revealed = Number(data);
      } else {
        const { data, error } = await ctx.supabaseAdmin
          .from("problem_hint_progress")
          .select("hints_revealed")
          .eq("user_id", userId)
          .eq("problem_id", problemId)
          .maybeSingle();

        if (error) return respond({ error: "Unable to load hint progress" }, 500);
        revealed = data?.hints_revealed ?? 0;
      }
    } else {
      // Guests receive hints but cannot earn XP.
      if (!Number.isInteger(guestCount) || (guestCount as number) < 0 ||
          (guestCount as number) > hints.length) {
        return respond({ error: "Invalid guest hint count" }, 400);
      }

      revealed = action === "reveal"
        ? Math.min((guestCount as number) + 1, hints.length)
        : guestCount as number;
    }

    return respond({
      revealed,
      total: hints.length,
      solved,
      hints: hints.slice(0, revealed)
    });
  })
};