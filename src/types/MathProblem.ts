//This file is the public data students are allowed to receive,
//so no problem answers should be put here.
export type Difficulty = "easy" | "medium" | "hard";

// "number" = automatically check on backend
// "expression" = initially manual review, then add symbolic checking later
// "proof" = save LaTeX submission for executive review
export type AnswerType = | "number" | "expression" | "proof";

// Represents a math problem on our website.
export interface MathProblem {
    id: string;

    // Basic problem info
    title: string;
    topic: string;
    difficulty: Difficulty;

    // Supports LaTeX in the problem statement
    question: string;

    // Hints are revealed one at a time
    hints: string[];

    //How students submit their answers
    answerType: AnswerType;

    //Gamification
    points: number;

    //Weekly practice organization
    weekNumber: number;
    order: number;
}