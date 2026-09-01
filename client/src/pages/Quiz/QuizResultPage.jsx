import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Trophy, RotateCcw } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import quizApi from '../../services/quizApi';
import QuizQuestionCard from '../../components/quiz/QuizQuestionCard.jsx';
import { PageLoader } from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

export default function QuizResultPage() {
  const { id } = useParams();
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);

  const { data, loading, error, refetch } = useFetch(() => quizApi.getResults(id), [id]);

  if (loading) return <PageLoader label="Loading results..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorState message={error} onRetry={refetch} /></div>;
  if (!data) return null;

  const { attempts, questions } = data;
  if (attempts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState icon={Trophy} title="No attempts yet" description="Take the quiz to see your results here." />
      </div>
    );
  }

  const latest = attempts.find((a) => a._id === selectedAttemptId) || attempts[0];
  const answerMap = Object.fromEntries(latest.answers.map((a) => [a.questionId, a.answer]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="card flex flex-col items-center gap-2 p-8 text-center">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${latest.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
          <Trophy size={26} />
        </div>
        <p className="text-3xl font-bold text-ink-900">{latest.percent}%</p>
        <p className="text-sm text-ink-500">{latest.score} / {latest.totalPoints} points · {latest.passed ? 'Passed' : 'Not passed'}</p>
        <Link to={`/quizzes/${id}`} className="btn-secondary mt-3"><RotateCcw size={15} /> Retake Quiz</Link>
      </div>

      {attempts.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {attempts.map((a, i) => (
            <button
              key={a._id}
              onClick={() => setSelectedAttemptId(a._id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                (selectedAttemptId || attempts[0]._id) === a._id ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-500'
              }`}
            >
              Attempt {attempts.length - i} · {a.percent}%
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-ink-900">Review answers</h2>
        {questions.map((q, i) => (
          <QuizQuestionCard key={q._id} question={q} index={i} value={answerMap[q._id]} onChange={() => {}} review />
        ))}
      </div>
    </div>
  );
}
