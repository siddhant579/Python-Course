import {
  Code2, GitBranch, RotateCw, Package, Database, ListChecks, Braces,
  Layers, FileText, Terminal, Type, Hash, Puzzle, Boxes,
} from 'lucide-react';

// Picks a representative icon for a topic based on keywords in its title.
// Purely cosmetic - never used to decide behavior, so an unmatched/novel
// topic title just falls back to a sensible default instead of breaking.
const RULES = [
  [/loop|iterat|while|range/i, RotateCw],
  [/condition|if|else|branch|decision/i, GitBranch],
  [/function|def |method/i, Package],
  [/list|array|tuple|dict|set|data structure/i, Boxes],
  [/string|text/i, Type],
  [/number|math|operator/i, Hash],
  [/file|i\/o|input|output/i, FileText],
  [/class|object|oop/i, Braces],
  [/database|sql/i, Database],
  [/exercise|practice|challenge/i, Puzzle],
  [/module|package|import/i, Layers],
  [/basic|intro|getting started|variable/i, Terminal],
  [/checklist|task|todo/i, ListChecks],
];

export default function getTopicIcon(title = '') {
  const match = RULES.find(([regex]) => regex.test(title));
  return match ? match[1] : Code2;
}
