import { ShieldAlert } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Privacy Policy</h1>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <ShieldAlert size={18} className="mt-0.5 flex-shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          This is placeholder text, not a real, legally-reviewed privacy policy. Replace this page with an actual
          policy (drafted or reviewed by a lawyer, covering what data you collect, how you store and use it, and
          user rights) before this platform goes live with real users.
        </p>
      </div>

      <div className="prose prose-sm mt-8 max-w-none text-ink-600">
        <p>PyLearn collects the information you provide when you create an account (name, email) and the activity
        generated as you use the platform (lesson progress, quiz attempts, exercise completions), so we can show
        you your own progress and let instructors manage course content.</p>
        <p>We do not sell personal data to third parties. Passwords are stored using one-way hashing (bcrypt) and
        are never visible to administrators, even in the database.</p>
        <p>Contact your platform administrator with any questions about your data.</p>
      </div>
    </div>
  );
}
