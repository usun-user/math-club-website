export type Difficulty = "easy" | "medium" | "hard";

// Represents a math problem on our website.
export interface MathProblem {
    id: string;
    title: string;
    topic: string;
    difficulty: Difficulty;
    question: string;
    hints: string[];
    points: number;
}