import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathTextProps {
  text: string;
}

// Recognizes two kinds of LaTeX:

// 1) Syntax: "$x^2 + 3x = 10$". Result: inline math

// 2) Syntax: "$$\frac{a}{b}$$". Result: display math 
// (in this case it would show a fraction with a in numerator and b in denominator)

export default function MathText({ text }: MathTextProps) {
  const parts = useMemo(() => {
    // Recognize display math ($$...$$) and inline math ($...$).
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;

    return text.split(regex).filter(Boolean);
  }, [text]);

  return (
    <div className="math-text">
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const expression = part.slice(2, -2);

          return (
            <div
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(expression, {
                  displayMode: true,
                  throwOnError: false,
                  trust: false,
                  strict: "warn",
                }),
              }}
            />
          );
        }

        if (part.startsWith("$") && part.endsWith("$")) {
          const expression = part.slice(1, -1);

          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(expression, {
                  displayMode: false,
                  throwOnError: false,
                  trust: false,
                  strict: "warn",
                }),
              }}
            />
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}