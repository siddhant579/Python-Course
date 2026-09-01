import CodeQuestion from './CodeQuestion.jsx';

export default function QuizQuestionCard({ question, index, value, onChange, review }) {
  const isCorrect = review && String(value).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();

  const options =
    question.type === 'truefalse' ? ['true', 'false'] : question.type === 'mcq' ? question.options : null;

  if (question.type === 'code') {
    return (
      <div className="card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Question {index + 1} · Write code</p>
        <h3 className="mt-1 font-medium text-ink-800">{question.text}</h3>
        <CodeQuestion question={question} value={value} onChange={onChange} review={review} />
        {review && (
          <div className="mt-3 space-y-1 text-sm">
            <p className={isCorrect ? 'font-medium text-emerald-600' : 'font-medium text-red-600'}>
              {isCorrect ? 'Correct' : 'Incorrect — see expected output above'}
            </p>
            {question.explanation && <p className="text-ink-500">{question.explanation}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Question {index + 1}</p>
      <h3 className="mt-1 font-medium text-ink-800">{question.text}</h3>

      <div className="mt-4 space-y-2">
        {options ? (
          options.map((opt) => {
            const selected = String(value) === String(opt);
            const correctOpt = review && String(opt).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
            return (
              <label
                key={opt}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                  review
                    ? correctOpt
                      ? 'border-emerald-300 bg-emerald-50'
                      : selected
                      ? 'border-red-300 bg-red-50'
                      : 'border-ink-100'
                    : selected
                    ? 'border-brand-400 bg-brand-50'
                    : 'border-ink-200 hover:bg-ink-50'
                }`}
              >
                <input
                  type="radio"
                  name={`q-${question._id}`}
                  className="accent-brand-500"
                  checked={selected}
                  disabled={review}
                  onChange={() => onChange(opt)}
                />
                <span className="capitalize text-ink-700">{opt}</span>
              </label>
            );
          })
        ) : (
          <input
            type="text"
            className="input"
            placeholder="Type your answer"
            value={value || ''}
            disabled={review}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>

      {review && (
        <div className="mt-3 space-y-1 text-sm">
          <p className={isCorrect ? 'font-medium text-emerald-600' : 'font-medium text-red-600'}>
            {isCorrect ? 'Correct' : `Incorrect — correct answer: ${question.correctAnswer}`}
          </p>
          {question.explanation && <p className="text-ink-500">{question.explanation}</p>}
        </div>
      )}
    </div>
  );
}
