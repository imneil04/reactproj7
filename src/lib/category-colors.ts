const categoryPalettes = [
  {
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
    bar: "bg-sky-500",
    card: "border-sky-200 bg-sky-50/40",
    dot: "bg-sky-500",
  },
  {
    badge: "bg-violet-50 text-violet-700 ring-violet-200",
    bar: "bg-violet-500",
    card: "border-violet-200 bg-violet-50/40",
    dot: "bg-violet-500",
  },
  {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    bar: "bg-emerald-500",
    card: "border-emerald-200 bg-emerald-50/40",
    dot: "bg-emerald-500",
  },
  {
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    bar: "bg-amber-500",
    card: "border-amber-200 bg-amber-50/40",
    dot: "bg-amber-500",
  },
  {
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    bar: "bg-rose-500",
    card: "border-rose-200 bg-rose-50/40",
    dot: "bg-rose-500",
  },
  {
    badge: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    bar: "bg-cyan-500",
    card: "border-cyan-200 bg-cyan-50/40",
    dot: "bg-cyan-500",
  },
];

function getCategoryColorIndex(category: string) {
  return [...category].reduce((total, character) => total + character.charCodeAt(0), 0) % categoryPalettes.length;
}

export function getCategoryColors(category: string) {
  return categoryPalettes[getCategoryColorIndex(category || "Uncategorized")];
}
