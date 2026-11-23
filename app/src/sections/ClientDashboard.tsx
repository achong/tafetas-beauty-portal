// app/src/sections/ClientDashboard.tsx
import { useState, useEffect, useMemo } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, User, Heart, Activity, Sparkles, Scissors } from 'lucide-react';
import type { Client } from '@/types';

interface ClientDashboardProps {
  client: Client;
  onUpdateClient: (updatedClient: Client) => void;
  onLogout: () => void;
  onSwitchView: (view: any) => void;
}

export function ClientDashboard({ client, onUpdateClient, onLogout, onSwitchView }: ClientDashboardProps) {
  const [formData, setFormData] = useState<Client>(client);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Calculate Age from DOB
  const age = useMemo(() => {
    if (!formData.dob) return null;
    const diff = Date.now() - new Date(formData.dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }, [formData.dob]);

  useEffect(() => {
    setFormData(client);
  }, [client]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'clients', client.uid), formData as any);
      onUpdateClient(formData);
      setMessage('Profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Client, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: keyof Client, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent] as any), [field]: value }
    }));
  };

  return (
    <div className="fade-in max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
          <p className="text-muted-foreground text-sm">Manage your details and medical history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onSwitchView('booking')}>Book Appointment</Button>
          <Button variant="destructive" onClick={onLogout}>Logout</Button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('Error') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
          {message}
        </div>
      )}

      {/* Personal Details */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Personal Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Full Name</Label><Input value={formData.name} onChange={e => updateField('name', e.target.value)} className="bg-background border-border text-foreground" /></div>
          <div><Label>Email</Label><Input value={formData.email} disabled className="bg-muted border-border text-muted-foreground" /></div>
          <div><Label>Phone</Label><Input value={formData.phone || ''} onChange={e => updateField('phone', e.target.value)} className="bg-background border-border text-foreground" /></div>
          <div><Label>Date of Birth {age !== null && <span className="text-primary ml-2">(Age: {age})</span>}</Label><Input type="date" value={formData.dob || ''} onChange={e => updateField('dob', e.target.value)} className="bg-background border-border text-foreground" /></div>
          <div className="md:col-span-2"><Label>Address</Label><Input value={formData.address || ''} onChange={e => updateField('address', e.target.value)} className="bg-background border-border text-foreground" /></div>
          <div><Label>Occupation</Label><Input value={formData.occupation || ''} onChange={e => updateField('occupation', e.target.value)} className="bg-background border-border text-foreground" /></div>
        </CardContent>
      </Card>

      {/* Medical History */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><Heart className="w-5 h-5 text-primary" /> Medical History</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Conditions (comma separated, e.g., Acne, Eczema)</Label>
            <Input value={(formData.medical_history?.conditions || []).join(', ')} onChange={e => updateNestedField('medical_history', 'conditions', e.target.value.split(',').map(s => s.trim()))} className="bg-background border-border text-foreground" />
          </div>
          <div><Label>Details of conditions</Label><Input value={formData.medical_history?.details || ''} onChange={e => updateNestedField('medical_history', 'details', e.target.value)} className="bg-background border-border text-foreground" /></div>
          <div><Label>Medications / Supplements</Label><Input value={formData.medical_history?.medications || ''} onChange={e => updateNestedField('medical_history', 'medications', e.target.value)} className="bg-background border-border text-foreground" /></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['accutane', 'radiation_chemo', 'recent_surgery', 'pregnancy', 'contact_lenses'].map(field => (
              <label key={field} className="flex items-center gap-2 text-sm text-foreground capitalize">
                <input type="checkbox" checked={!!(formData.medical_history as any)?.[field]} onChange={e => updateNestedField('medical_history', field, e.target.checked)} className="w-4 h-4 text-primary" />
                {field.replace('_', ' ')}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lifestyle */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Lifestyle</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['smokes', 'exercises', 'restricted_diet'].map(field => (
            <label key={field} className="flex items-center gap-2 text-sm text-foreground capitalize">
              <input type="checkbox" checked={!!(formData.lifestyle as any)?.[field]} onChange={e => updateNestedField('lifestyle', field, e.target.checked)} className="w-4 h-4 text-primary" />
              {field.replace('_', ' ')}
            </label>
          ))}
          <div><Label>Diet Details</Label><Input value={formData.lifestyle?.diet_details || ''} onChange={e => updateNestedField('lifestyle', 'diet_details', e.target.value)} className="bg-background border-border text-foreground" /></div>
          <div><Label>Water Intake (daily)</Label><Input value={formData.lifestyle?.water_intake || ''} onChange={e => updateNestedField('lifestyle', 'water_intake', e.target.value)} className="bg-background border-border text-foreground" /></div>
          <div><Label>Caffeine (daily)</Label><Input value={formData.lifestyle?.caffeine_intake || ''} onChange={e => updateNestedField('lifestyle', 'caffeine_intake', e.target.value)} className="bg-background border-border text-foreground" /></div>
          <div><Label>Alcohol (weekly)</Label><Input value={formData.lifestyle?.alcohol_intake || ''} onChange={e => updateNestedField('lifestyle', 'alcohol_intake', e.target.value)} className="bg-background border-border text-foreground" /></div>
          <div><Label>Stress Level</Label><Input value={formData.lifestyle?.stress_level || ''} onChange={e => updateNestedField('lifestyle', 'stress_level', e.target.value)} className="bg-background border-border text-foreground" /></div>
        </CardContent>
      </Card>

      {/* Skin & Hair */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Skin Care</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Products (comma separated)</Label><Input value={(formData.skin_care_regime?.products || []).join(', ')} onChange={e => updateNestedField('skin_care_regime', 'products', e.target.value.split(',').map(s => s.trim()))} className="bg-background border-border text-foreground" /></div>
            <div><Label>Active Ingredients</Label><Input value={(formData.skin_care_regime?.active_ingredients || []).join(', ')} onChange={e => updateNestedField('skin_care_regime', 'active_ingredients', e.target.value.split(',').map(s => s.trim()))} className="bg-background border-border text-foreground" /></div>
            {['sunscreen', 'prescription_skincare', 'injectables_3mo', 'peels_1mo'].map(field => (
              <label key={field} className="flex items-center gap-2 text-sm text-foreground capitalize block">
                <input type="checkbox" checked={!!(formData.skin_care_regime as any)?.[field]} onChange={e => updateNestedField('skin_care_regime', field, e.target.checked)} className="w-4 h-4 text-primary" />
                {field.replace('_', ' ')}
              </label>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="flex items-center gap-2"><Scissors className="w-5 h-5 text-primary" /> Hair</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Concerns (comma separated)</Label><Input value={(formData.hair_concerns || []).join(', ')} onChange={e => updateField('hair_concerns', e.target.value.split(',').map(s => s.trim()))} className="bg-background border-border text-foreground" /></div>
            <div><Label>Chemical History</Label><Input value={formData.hair_chemical_history || ''} onChange={e => updateField('hair_chemical_history', e.target.value)} className="bg-background border-border text-foreground" /></div>
            <div><Label>Care Regime</Label><Input value={formData.hair_care_regime || ''} onChange={e => updateField('hair_care_regime', e.target.value)} className="bg-background border-border text-foreground" /></div>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-4 bg-card border border-border p-4 rounded-xl shadow-lg flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}