import { problems } from "../data/sampleProblems";
import type { MathProblem } from "../types/MathProblem";

// When we connect Supabase later, these functions will become asynchronous
// and retrieve data from the database instead of a local array.

export function getAllProblems(): MathProblem[] {
    return [...problems].sort(
        (a, b) =>
            a.weekNumber - b.weekNumber ||
            a.order - b.order
    );
}

export function getProblemById(id: string): MathProblem | undefined {
    return problems.find((problem) => problem.id === id);
}

export function getWeeklyProblems(weekNumber: number): MathProblem[] {
    return getAllProblems().filter((problem) => problem.weekNumber === weekNumber);
}