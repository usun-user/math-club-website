import type {
    AnswerSubmission,
    SubmissionResult
} from "../types/Submission";

/**
 * Submits a student's answer for grading.
 * 
 * This is a temporary placeholder.
 * Real grading will happen securely on the backend.
 */
export async function submitAnswer(submission: AnswerSubmission): Promise<SubmissionResult> {
    // Prevent unused parameter warnings for now.
    void submission;

    return {
        status: "pending_review",
        feedback: "answer checking is not connected yet.",
        pointsAwarded: 0
    };
}