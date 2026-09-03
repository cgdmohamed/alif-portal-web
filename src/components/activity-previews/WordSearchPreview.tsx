const fillerLetters = ['ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ر', 'س', 'ش', 'ص', 'ط', 'ف', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي']

function fillerAt(row: number, col: number) {
  return fillerLetters[(row * 8 + col) % fillerLetters.length]
}

// "قراءة" placed horizontally on row 2, cols 0-4
const wordOne = ['ق', 'ر', 'ا', 'ء', 'ة']
// "علم" placed vertically on col 6, rows 1-3
const wordTwo = ['ع', 'ل', 'م']

function buildGrid() {
  const grid: string[][] = Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 8 }, (_, col) => fillerAt(row, col)),
  )
  wordOne.forEach((letter, i) => {
    grid[2][i] = letter
  })
  wordTwo.forEach((letter, i) => {
    grid[1 + i][6] = letter
  })
  return grid
}

function isHighlighted(row: number, col: number) {
  const inWordOne = row === 2 && col < wordOne.length
  const inWordTwo = col === 6 && row >= 1 && row <= 3
  return inWordOne || inWordTwo
}

const wordList = [
  { label: 'قراءة', found: true },
  { label: 'علم', found: true },
  { label: 'معرفة', found: false },
]

export default function WordSearchPreview() {
  const grid = buildGrid()

  return (
    <div className="flex flex-wrap items-start gap-6 rounded-xl2 bg-white p-5 shadow-card">
      <div className="grid grid-cols-8 gap-1" dir="ltr">
        {grid.map((row, r) =>
          row.map((letter, c) => (
            <div
              key={`${r}-${c}`}
              className={`flex h-8 w-8 items-center justify-center rounded-md font-sans text-sm font-bold ${
                isHighlighted(r, c) ? 'bg-indigo text-white' : 'bg-surface-alt text-ink-soft'
              }`}
            >
              {letter}
            </div>
          )),
        )}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-ink-soft">الكلمات المطلوبة</span>
        {wordList.map((w) => (
          <span
            key={w.label}
            className={`text-sm font-semibold ${w.found ? 'text-ink-faint line-through' : 'text-ink'}`}
          >
            {w.label}
          </span>
        ))}
      </div>
    </div>
  )
}
