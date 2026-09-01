import { ShieldAlert } from 'lucide-react';

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Terms & Conditions</h1>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <ShieldAlert size={18} className="mt-0.5 flex-shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          This is placeholder text, not real, legally-reviewed terms of service. Replace this page with actual
          terms (ideally reviewed by a lawyer) covering acceptable use, account responsibilities, and liability
          before this platform goes live with real users.
        </p>
      </div>

      <div className="prose prose-sm mt-8 max-w-none text-ink-600">
        <p>By creating an account, you agree to use PyLearn for personal learning purposes and to keep your
        account credentials confidential.</p>
        <p>Course content is provided for educational use. Redistributing or reselling course material without
        permission from the platform owner is not allowed.</p>
        <p>The platform is provided "as is" without warranty of any kind while in active development.</p>
      </div>
    </div>
  );
}
