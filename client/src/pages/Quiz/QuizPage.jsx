import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HelpCircle, Send } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import quizApi from '../../services/quizApi';
import { getErrorMessage } from '../../services/api';
import QuizQuestionCard from '../../components/quiz/QuizQuestionCard.jsx';
import { PageLoader } from '../../components/common/Spinner.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, error, refetch } = useFetch(() => quizApi.getOne(id), [id]);

  if (loading) return <PageLoader label="Loading quiz..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-10"><ErrorState message={error} onRetry={refetch} /></div>;
  if (!data) return null;

  const { quiz, questions } = data;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({ questionId: q._id, answer: answers[q._id] || '' }));
      const { attempt } = await quizApi.submit(quiz._id, payload);
      navigate(`/quizzes/${quiz._id}/results`, { state: { justSubmittedId: attempt._id } });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.values(answers).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
          <HelpCircle size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink-900">{quiz.title}</h1>
          <p className="text-sm text-ink-500">{questions.length} questions · Pass mark {quiz.passPercent}%</p>
        </div>
      </div>
      {quiz.description && <p className="mt-4 text-ink-600">{quiz.description}</p>}

      <div className="mt-8 space-y-4">
        {questions.map((q, i) => (
          <QuizQuestionCard
            key={q._id}
            question={q}
            index={i}
            value={answers[q._id]}
            onChange={(val) => setAnswers((a) => ({ ...a, [q._id]: val }))}
          />
        ))}
      </div>

      <div className="sticky bottom-4 mt-8 flex items-center justify-between rounded-xl border border-ink-100 bg-white/95 px-5 py-4 shadow-cardHover backdrop-blur">
        <span className="text-sm text-ink-500">{answeredCount} / {questions.length} answered</span>
        <button className="btn-primary" disabled={submitting} onClick={handleSubmit}>
          <Send size={15} /> {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
}
