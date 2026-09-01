import { Settings as SettingsIcon, ShieldCheck, Save } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import authApi from '../../services/authApi';
import { getErrorMessage } from '../../services/api';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { user: updated } = await authApi.updateProfile({ name });
      updateUser(updated);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Settings</h1>
          <p className="text-sm text-ink-500">Admin account settings.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="card mt-6 max-w-lg space-y-4 p-6">
        <div>
          <label className="label">Admin name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input bg-ink-50" value={user?.email || ''} disabled />
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-brand-50 p-3 text-sm text-brand-700">
          <ShieldCheck size={16} /> Role: Administrator
        </div>
        <button className="btn-primary" disabled={saving}><Save size={15} /> {saving ? 'Saving...' : 'Save'}</button>
      </form>
    </div>
  );
}
