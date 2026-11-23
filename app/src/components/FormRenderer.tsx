// app/src/components/FormRenderer.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Form, FormResponse } from '@/types';

interface FormRendererProps {
  form: Form;
  initialValues?: Record<string, any>;
  onSubmit: (responses: FormResponse[]) => void;
  onCancel: () => void;
}

export function FormRenderer({ form, initialValues = {}, onSubmit, onCancel }: FormRendererProps) {
  // ✅ FIX: Explicitly define the fields array to prevent TypeScript 'never' inference
  const fields = form.client_session_fields || [];

  const [responses, setResponses] = useState<FormResponse[]>(() => {
    return fields.map((field: any) => ({
      field_id: field.field_id,
      value: initialValues[field.field_id] !== undefined
        ? initialValues[field.field_id]
        : (field.type === 'checkbox' ? false : '')
    }));
  });

  const updateResponse = (field_id: string, value: any) => {
    setResponses(prev => 
      prev.map(r => r.field_id === field_id ? { ...r, value } : r)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(responses);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* ✅ FIX: Added parentheses around (fields) so .map() executes correctly */}
        {(fields).map((field: any) => (
          <div key={field.field_id} className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            
            {field.type === 'text' && (
              <Input 
                value={responses.find(r => r.field_id === field.field_id)?.value || ''}
                onChange={(e) => updateResponse(field.field_id, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="bg-background border-border text-foreground"
              />
            )}
            
            {field.type === 'textarea' && (
              <Textarea 
                value={responses.find(r => r.field_id === field.field_id)?.value || ''}
                onChange={(e) => updateResponse(field.field_id, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="min-h-[100px] bg-background border-border text-foreground"
              />
            )}

            {field.type === 'select' && (
              <Select 
                value={responses.find(r => r.field_id === field.field_id)?.value?.toString() || ''}
                onValueChange={(val) => updateResponse(field.field_id, val)}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder={field.placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {field.options?.map((opt: string) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === 'radio' && (
              <RadioGroup 
                value={responses.find(r => r.field_id === field.field_id)?.value?.toString() || ''}
                onValueChange={(val) => updateResponse(field.field_id, val)}
                className="flex flex-col space-y-2"
              >
                {field.options?.map((opt: string) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt} id={`${field.field_id}-${opt}`} />
                    <Label htmlFor={`${field.field_id}-${opt}`} className="font-normal cursor-pointer text-foreground">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {field.type === 'checkbox' && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={field.field_id}
                  checked={!!responses.find(r => r.field_id === field.field_id)?.value}
                  onCheckedChange={(checked) => updateResponse(field.field_id, checked)}
                />
                <Label htmlFor={field.field_id} className="font-normal cursor-pointer text-foreground">{field.label}</Label>
              </div>
            )}

            {field.type === 'signature' && (
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center text-muted-foreground bg-muted/30">
                <p className="text-sm mb-2">Digital Signature</p>
                <Input 
                  type="text" 
                  placeholder="Type your full name as signature"
                  value={responses.find(r => r.field_id === field.field_id)?.value || ''}
                  onChange={(e) => updateResponse(field.field_id, e.target.value)}
                  className="bg-background border-border text-foreground"
                  required={field.required}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 border-border text-foreground hover:bg-accent">
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
          Submit & Continue
        </Button>
      </div>
    </form>
  );
}