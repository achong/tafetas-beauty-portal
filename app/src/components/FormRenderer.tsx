// app/src/components/FormRenderer.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Form, FormResponse } from '@/types';

interface FormRendererProps {
  form: Form;
  initialValues?: Record<string, any>;
  onSubmit: (responses: FormResponse[]) => void;
  onCancel?: () => void;
  isReadOnly?: boolean;
}

export function FormRenderer({ 
  form, 
  initialValues = {}, 
  onSubmit, 
  onCancel,
  isReadOnly = false 
}: FormRendererProps) {
  const [responses, setResponses] = useState<FormResponse[]>([]);

  // Initialize responses
  useEffect(() => {
    const initial = form.fields.map(field => ({
      field_id: field.field_id,
      value: initialValues[field.field_id] !== undefined 
        ? initialValues[field.field_id] 
        : (field.type === 'checkbox' ? false : '')
    }));
    setResponses(initial);
  }, [form, initialValues]);

  const handleChange = (fieldId: string, value: any) => {
    setResponses(prev => 
      prev.map(r => r.field_id === fieldId ? { ...r, value } : r)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(responses);
  };

  const renderField = (field: any) => {
    const currentResponse = responses.find(r => r.field_id === field.field_id);
    const value = currentResponse?.value;

    const baseInputClass = "w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50";

    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
        return (
          <Input
            type={field.type}
            value={value as string}
            onChange={(e) => handleChange(field.field_id, e.target.value)}
            placeholder={field.placeholder}
            disabled={isReadOnly}
            className={baseInputClass}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleChange(field.field_id, e.target.value)}
            placeholder={field.placeholder}
            disabled={isReadOnly}
            className={`${baseInputClass} min-h-[100px] resize-y`}
          />
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id={field.field_id}
              checked={value as boolean}
              onChange={(e) => handleChange(field.field_id, e.target.checked)}
              disabled={isReadOnly}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor={field.field_id} className="text-sm font-normal cursor-pointer">
              {field.label}
            </Label>
          </div>
        );
      
      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => handleChange(field.field_id, e.target.value)}
            disabled={isReadOnly}
            className={baseInputClass}
          >
            <option value="">Select an option...</option>
            {field.options?.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      
      case 'signature':
        return (
          <div className="border border-dashed border-border rounded-lg p-6 bg-muted/10 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {isReadOnly ? 'Client Signature on File' : 'Digital Signature Required'}
            </p>
            {isReadOnly ? (
              <p className="font-script text-2xl text-foreground italic">[ Signed Electronically ]</p>
            ) : (
              <Button type="button" variant="outline" size="sm" disabled>
                Signature Pad (Coming Soon)
              </Button>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Header */}
      <div className="space-y-2 border-b border-border pb-4">
        <h3 className="text-xl font-bold text-foreground">{form.title}</h3>
        {form.description && (
          <p className="text-sm text-muted-foreground">{form.description}</p>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {form.fields.map((field) => (
          <div key={field.field_id} className="space-y-2">
            {/* Don't render label for checkboxes as it's handled inside the checkbox render */}
            {field.type !== 'checkbox' && (
              <Label className="text-sm font-medium text-foreground">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
            {field.helper_text && field.type !== 'checkbox' && (
              <p className="text-xs text-muted-foreground">{field.helper_text}</p>
            )}
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {!isReadOnly && (
        <div className="flex gap-3 pt-6 border-t border-border">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          )}
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            Submit & Continue
          </Button>
        </div>
      )}
    </form>
  );
}

