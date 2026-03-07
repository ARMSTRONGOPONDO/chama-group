import { useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FormInput } from '../components/ui/FormInput';
import { Alert } from '../components/ui/Alert';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: 'Chama Manager',
    currency: 'KSh',
    fiscalYearStart: '01',
    fiscalYearEnd: '12',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      {saved && (
        <Alert type="success" onDismiss={() => setSaved(false)} dismissible>
          Settings saved successfully.
        </Alert>
      )}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          <FormInput
            label="Organization name"
            value={formData.organizationName}
            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
          />
          <FormInput
            label="Currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            placeholder="e.g. KSh"
          />
          <div className="flex gap-4">
            <FormInput
              label="Fiscal year start (month)"
              type="number"
              min="1"
              max="12"
              value={formData.fiscalYearStart}
              onChange={(e) => setFormData({ ...formData, fiscalYearStart: e.target.value })}
            />
            <FormInput
              label="Fiscal year end (month)"
              type="number"
              min="1"
              max="12"
              value={formData.fiscalYearEnd}
              onChange={(e) => setFormData({ ...formData, fiscalYearEnd: e.target.value })}
            />
          </div>
          <Button type="submit" className="inline-flex items-center gap-2">
            <FiSave size={18} /> Save settings
          </Button>
        </form>
      </Card>
    </div>
  );
}
