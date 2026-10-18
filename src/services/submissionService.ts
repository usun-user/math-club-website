import { supabase } from "../lib/supabase";

import type {
  AnswerSubmission,
  SubmissionResult,
} from "../types/Submission";

export async function submitAnswer(
  submission: AnswerSubmission,
): Promise<SubmissionResult> {
  const { data, error } = await supabase.functions.invoke(
    "submit-answer",
    {
      body: submission,
    },
  );

  if (error) {
    throw new Error("Unable to check your answer.");
  }

  return data as SubmissionResult;
}