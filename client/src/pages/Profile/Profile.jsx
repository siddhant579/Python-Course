import { useState } from 'react';
import toast from 'react-hot-toast';
import { User, Lock, Save } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import authApi from '../../services/authApi';
import { getErrorMessage } from '../../services/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { user: updated } = await authApi.updateProfile({ name });
      updateUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await authApi.changePassword(pwForm);
      setPwForm({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-ink-900">Profile</h1>
      <p className="mt-1 text-ink-500">Manage your account details.</p>

      <form onSubmit={handleProfileSave} className="card mt-8 space-y-4 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-ink-800"><User size={17} /> Basic info</h2>
        <div>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input bg-ink-50" value={user?.email || ''} disabled />
        </div>
        <button className="btn-primary" disabled={savingProfile}>
          <Save size={15} /> {savingProfile ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <form onSubmit={handlePasswordSave} className="card mt-6 space-y-4 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-ink-800"><Lock size={17} /> Change password</h2>
        <div>
          <label className="label">Current password</label>
          <input
            type="password" required className="input"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
          />
        </div>
        <div>
          <label className="label">New password</label>
          <input
            type="password" required minLength={6} className="input"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
          />
        </div>
        <button className="btn-primary" disabled={savingPw}>
          <Save size={15} /> {savingPw ? 'Saving...' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
