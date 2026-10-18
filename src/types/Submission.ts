export type SubmissionStatus = | "correct" | "incorrect" | "pending_review";

export interface AnswerSubmission {
    problemId: string;

    // NOT number because student might enter a math expression or LaTeX proof
    // Backend will interpret the answer according to the problem's answerType
    answer: string;
}

export interface SubmissionResult {
    status: SubmissionStatus;
    feedback: string;
    pointsAwarded: number;
}