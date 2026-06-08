// app/src/data/forms.ts
import type { Form } from '@/types';

// Define your forms here. 
// The 'service_id' must match the 'service_id' of the service in your database.
export const SERVICE_FORMS: Form[] = [
  {
    form_id: "form_facial_basic",
    service_id: "facial_basic", // ⚠️ CHANGE THIS to match your actual service ID
    title: "Facial Treatment Consent & Consultation",
    description: "Please complete this form before your appointment.",
    is_required: true,
    created_at: new Date().toISOString(),
    fields: [
      {
        field_id: "full_name",
        label: "Full Legal Name",
        type: "text",
        required: true,
        placeholder: "Jane Doe"
      },
      {
        field_id: "dob",
        label: "Date of Birth",
        type: "date",
        required: true
      },
      {
        field_id: "allergies",
        label: "Do you have any known allergies? (e.g., nuts, latex, skincare ingredients)",
        type: "textarea",
        required: true,
        placeholder: "List any allergies here, or type 'None'."
      },
      {
        field_id: "pregnant",
        label: "Are you currently pregnant or breastfeeding?",
        type: "select",
        required: true,
        options: ["Yes, pregnant", "Yes, breastfeeding", "No", "Prefer not to say"]
      },
      {
        field_id: "consent",
        label: "I consent to the facial treatment and understand the aftercare instructions.",
        type: "checkbox",
        required: true
      }
    ]
  },
  // Add more forms here for other services...
];