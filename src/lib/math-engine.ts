export type Difficulty = "simple" | "medium" | "hard" | "very_hard";
export type Operation = "add" | "sub" | "mul" | "div";
export type MathMode = "mcq" | "type";

export type MathQuestion = {
  id: string;
  prompt: string;
  answer: number;
  operation: Operation;
  difficulty: Difficulty;
  choices: number[];
};

export const MATH_MODE_META: Record<
  MathMode,
  { label: string; description: string }
> = {
  mcq: {
    label: "Multiple Choice",
    description: "Pick the correct answer from four options.",
  },
  type: {
    label: "Type the Answer",
    description: "No options shown — enter the number yourself.",
  },
};

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; grades: string; description: string; questions: number }
> = {
  simple: {
    label: "Simple",
    grades: "Grades 1–2",
    description: "Small numbers, addition & subtraction.",
    questions: 8,
  },
  medium: {
    label: "Medium",
    grades: "Grades 3–4",
    description: "Bigger sums, intro multiplication.",
    questions: 10,
  },
  hard: {
    label: "Hard",
    grades: "Grades 5–6",
    description: "Multiplication, division, mixed ops.",
    questions: 12,
  },
  very_hard: {
    label: "Very Hard",
    grades: "Grades 7–8",
    description: "Larger numbers and multi-step feel.",
    questions: 12,
  },
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOps(difficulty: Difficulty): Operation[] {
  switch (difficulty) {
    case "simple":
      return ["add", "sub"];
    case "medium":
      return ["add", "sub", "mul"];
    case "hard":
      return ["add", "sub", "mul", "div"];
    case "very_hard":
      return ["add", "sub", "mul", "div"];
  }
}

function ranges(difficulty: Difficulty) {
  switch (difficulty) {
    case "simple":
      return { add: [1, 12], sub: [1, 12], mul: [1, 5], div: [1, 5] };
    case "medium":
      return { add: [10, 50], sub: [10, 50], mul: [2, 9], div: [2, 9] };
    case "hard":
      return { add: [20, 120], sub: [20, 120], mul: [3, 12], div: [2, 12] };
    case "very_hard":
      return { add: [50, 400], sub: [50, 400], mul: [6, 20], div: [3, 15] };
  }
}

function makeChoices(answer: number): number[] {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const delta = randInt(1, Math.max(3, Math.abs(answer) || 3));
    const candidate = answer + (Math.random() > 0.5 ? delta : -delta);
    if (candidate !== answer) set.add(candidate);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

function buildOne(difficulty: Difficulty): MathQuestion {
  const ops = pickOps(difficulty);
  const op = ops[randInt(0, ops.length - 1)];
  const r = ranges(difficulty);
  let a = 0;
  let b = 0;
  let answer = 0;
  let prompt = "";

  if (op === "add") {
    a = randInt(r.add[0], r.add[1]);
    b = randInt(r.add[0], r.add[1]);
    answer = a + b;
    prompt = `${a} + ${b} = ?`;
  } else if (op === "sub") {
    a = randInt(r.sub[0], r.sub[1]);
    b = randInt(r.sub[0], Math.min(a, r.sub[1]));
    answer = a - b;
    prompt = `${a} − ${b} = ?`;
  } else if (op === "mul") {
    a = randInt(r.mul[0], r.mul[1]);
    b = randInt(r.mul[0], r.mul[1]);
    answer = a * b;
    prompt = `${a} × ${b} = ?`;
  } else {
    b = randInt(r.div[0], r.div[1]);
    answer = randInt(r.div[0], r.div[1]);
    a = b * answer;
    prompt = `${a} ÷ ${b} = ?`;
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    prompt,
    answer,
    operation: op,
    difficulty,
    choices: makeChoices(answer),
  };
}

export function generateMathRound(difficulty: Difficulty): MathQuestion[] {
  const count = DIFFICULTY_META[difficulty].questions;
  return Array.from({ length: count }, () => buildOne(difficulty));
}

export function scoreRound(correct: number, total: number, difficulty: Difficulty) {
  const weight =
    difficulty === "simple"
      ? 10
      : difficulty === "medium"
        ? 15
        : difficulty === "hard"
          ? 20
          : 25;
  return correct * weight + (correct === total ? weight * 2 : 0);
}
