// app/src/data/forms.ts
import type { Form } from '@/types';

export const SERVICE_FORMS: Form[] = [
  // ==========================================
  // 1. HAIRDRESSING FORM
  // ==========================================
  {
    form_id: "form_hairdressing",
    service_id: "hair_cut", // Applies to hair_cut, hair_colour, hair_chemical_reformation, hair_consultation
    title: "Hairdressing Consultation & Treatment Plan",
    description: "Please complete the client sections before your appointment. The stylist will complete the rest.",
    is_required: true,
    created_at: new Date().toISOString(),
    
    client_static_fields: [
      { field_id: "medical_conditions", label: "Medical Conditions (e.g., Eczema, Alopecia, Allergies)", type: "textarea", required: true, placeholder: "List any conditions or type 'None'" },
      { field_id: "medications", label: "Medications causing hair loss/thinning?", type: "select", required: true, options: ["Yes", "No"] },
      { field_id: "pregnancy", label: "Currently pregnant or breastfeeding?", type: "select", required: true, options: ["Yes", "No"] },
      { field_id: "hair_concerns", label: "Hair & Scalp Concerns", type: "textarea", required: true, placeholder: "e.g., Dry hair, Oily scalp, Dandruff, Hair loss" },
      { field_id: "chemical_history", label: "Chemical History (Colour, Bleach, Keratin, Perms)", type: "textarea", required: true, placeholder: "When was it last done? Details of products used." },
      { field_id: "hair_care_regime", label: "Hair Care Regime", type: "textarea", required: true, placeholder: "Products used, heat tool frequency, sun/chlorine exposure, extensions." }
    ],
    client_session_fields: [
      { field_id: "service_goal", label: "What are you hoping to achieve from your service today?", type: "textarea", required: true },
      { field_id: "satisfaction", label: "Are you happy with your current hairstyle/colour? If not, what would you change?", type: "textarea", required: true },
      { field_id: "agreement", label: "I have read the TasTAFE General Agreement & Model Release and understand my responsibilities.", type: "checkbox", required: true },
      { field_id: "client_signature", label: "Client Digital Signature", type: "signature", required: true }
    ],
    therapist_pre_fields: [
      { field_id: "therapist_name", label: "Therapist Name", type: "text", required: true },
      { field_id: "contraindications_prevent", label: "Contraindications preventing service?", type: "select", required: true, options: ["Yes", "No", "N/A"] },
      { field_id: "contraindications_modify", label: "Contraindications requiring modification?", type: "select", required: true, options: ["Yes", "No", "N/A"] },
      { field_id: "patch_test_date", label: "Patch Test Date", type: "date", required: false },
      { field_id: "patch_test_result", label: "Patch Test Result", type: "select", required: false, options: ["Positive", "Negative", "N/A"] },
      { field_id: "treatment_plan", label: "Proposed Treatment Plan & Techniques", type: "textarea", required: true }
    ],
    therapist_post_fields: [
      { field_id: "finish_time", label: "Finish Time", type: "text", required: true },
      { field_id: "total_time", label: "Total Time of Service", type: "text", required: true },
      { field_id: "adverse_effects", label: "Any adverse effects?", type: "select", required: true, options: ["Yes", "No"] },
      { field_id: "aftercare_advice", label: "Aftercare advice given & products recommended", type: "textarea", required: true },
      { field_id: "cost", label: "Cost of Service ($)", type: "number", required: true },
      { field_id: "payment_method", label: "Payment Method", type: "select", required: true, options: ["Cash", "Eftpos", "Other"] }
    ],
    assessor_fields: [
      { field_id: "assessment_result", label: "Assessment Result", type: "select", required: true, options: ["Satisfactory", "Not Satisfactory"] },
      { field_id: "assessor_signature", label: "Assessor Signature", type: "signature", required: true },
      { field_id: "assessor_feedback", label: "Assessor Feedback/Comments", type: "textarea", required: false }
    ]
  },

  // ==========================================
  // 2. BEAUTY & FACIAL FORM
  // ==========================================
  {
    form_id: "form_beauty_facial",
    service_id: "facial_basic", // Applies to facial_basic and other skin services
    title: "Beauty & Facial Treatment Plan",
    description: "Please complete the client sections before your appointment.",
    is_required: true,
    created_at: new Date().toISOString(),
    
    client_static_fields: [
      { field_id: "medical_conditions", label: "Medical Conditions (e.g., Acne, Eczema, Rosacea, Epilepsy)", type: "textarea", required: true },
      { field_id: "medications", label: "Medications (especially Accutane/Retin A)?", type: "select", required: true, options: ["Yes", "No"] },
      { field_id: "pregnancy", label: "Currently pregnant or breastfeeding?", type: "select", required: true, options: ["Yes", "No"] },
      { field_id: "skin_care_regime", label: "Current Skin Care Products & Active Ingredients", type: "textarea", required: true, placeholder: "e.g., Cleanser, Retinol, Glycolic Acid" },
      { field_id: "recent_treatments", label: "Recent cosmetic injectables, peels, or microdermabrasion (past 1-3 months)?", type: "select", required: true, options: ["Yes", "No"] }
    ],
    client_session_fields: [
      { field_id: "service_goal", label: "What are you hoping to achieve from your treatment today?", type: "textarea", required: true },
      { field_id: "special_requirements", label: "Do you have any special requirements for your treatment?", type: "textarea", required: false },
      { field_id: "agreement", label: "I certify that all information given is accurate and I agree to the proposed treatment.", type: "checkbox", required: true },
      { field_id: "client_signature", label: "Client Digital Signature", type: "signature", required: true }
    ],
    therapist_pre_fields: [
      { field_id: "therapist_name", label: "Therapist Name", type: "text", required: true },
      { field_id: "contraindications_prevent", label: "Contraindications preventing service?", type: "select", required: true, options: ["Yes", "No", "N/A"] },
      { field_id: "contraindications_modify", label: "Contraindications requiring modification?", type: "select", required: true, options: ["Yes", "No", "N/A"] },
      { field_id: "patch_test_date", label: "Patch Test Date (if applicable)", type: "date", required: false },
      { field_id: "patch_test_result", label: "Patch Test Result", type: "select", required: false, options: ["Positive", "Negative", "N/A"] },
      { field_id: "skin_analysis", label: "Skin Analysis (Type, Fitzpatrick, Conditions, Photoaging)", type: "textarea", required: true },
      { field_id: "treatment_plan", label: "Proposed Treatment Plan, Products & Techniques", type: "textarea", required: true }
    ],
    therapist_post_fields: [
      { field_id: "finish_time", label: "Finish Time", type: "text", required: true },
      { field_id: "total_time", label: "Total Time of Service", type: "text", required: true },
      { field_id: "adverse_effects", label: "Any adverse effects?", type: "select", required: true, options: ["Yes", "No"] },
      { field_id: "aftercare_advice", label: "Aftercare advice & products recommended", type: "textarea", required: true },
      { field_id: "cost", label: "Cost of Service ($)", type: "number", required: true },
      { field_id: "payment_method", label: "Payment Method", type: "select", required: true, options: ["Cash", "Eftpos", "Other"] }
    ],
    assessor_fields: [
      { field_id: "assessment_result", label: "Assessment Result", type: "select", required: true, options: ["Satisfactory", "Not Satisfactory"] },
      { field_id: "assessor_signature", label: "Assessor Signature", type: "signature", required: true },
      { field_id: "assessor_feedback", label: "Assessor Feedback/Comments", type: "textarea", required: false }
    ]
  },

  // ==========================================
  // 3. NAILS & LASH/BROW FORM
  // ==========================================
  {
    form_id: "form_nails_lash",
    service_id: "nail_service", // Generic ID for nail/lash services
    title: "Nail & Lash/Brow Treatment Plan",
    description: "Please complete the client sections before your appointment.",
    is_required: true,
    created_at: new Date().toISOString(),
    
    client_static_fields: [
      { field_id: "medical_conditions", label: "Medical Conditions (e.g., Diabetes, Circulatory disorders, Skin conditions)", type: "textarea", required: true },
      { field_id: "allergies", label: "Allergies (especially to acrylics, glues, or henna)?", type: "select", required: true, options: ["Yes", "No"] },
      { field_id: "pregnancy", label: "Currently pregnant or breastfeeding?", type: "select", required: true, options: ["Yes", "No"] }
    ],
    client_session_fields: [
      { field_id: "service_goal", label: "Desired nail shape, length, or lash style?", type: "textarea", required: true },
      { field_id: "age_consent", label: "Is the client over the age of consent (18 for intimate, 16 for chemical)?", type: "select", required: true, options: ["Yes", "No"] },
      { field_id: "agreement", label: "I agree to the proposed nail/lash plan and understand the risks.", type: "checkbox", required: true },
      { field_id: "client_signature", label: "Client Digital Signature", type: "signature", required: true }
    ],
    therapist_pre_fields: [
      { field_id: "therapist_name", label: "Therapist Name", type: "text", required: true },
      { field_id: "contraindications_prevent", label: "Contraindications preventing service?", type: "select", required: true, options: ["Yes", "No", "N/A"] },
      { field_id: "contraindications_modify", label: "Contraindications requiring modification?", type: "select", required: true, options: ["Yes", "No", "N/A"] },
      { field_id: "patch_test_date", label: "Patch Test Date", type: "date", required: false },
      { field_id: "patch_test_result", label: "Patch Test Result", type: "select", required: false, options: ["Positive", "Negative", "N/A"] },
      { field_id: "nail_lash_analysis", label: "Nail/Lash Analysis (Shape, condition, density, eye shape)", type: "textarea", required: true },
      { field_id: "treatment_plan", label: "Proposed Treatment Plan, Products & Techniques", type: "textarea", required: true }
    ],
    therapist_post_fields: [
      { field_id: "finish_time", label: "Finish Time", type: "text", required: true },
      { field_id: "total_time", label: "Total Time of Service", type: "text", required: true },
      { field_id: "adverse_effects", label: "Any adverse effects?", type: "select", required: true, options: ["Yes", "No"] },
      { field_id: "aftercare_advice", label: "Aftercare advice & products recommended", type: "textarea", required: true },
      { field_id: "cost", label: "Cost of Service ($)", type: "number", required: true },
      { field_id: "payment_method", label: "Payment Method", type: "select", required: true, options: ["Cash", "Eftpos", "Other"] }
    ],
    assessor_fields: [
      { field_id: "assessment_result", label: "Assessment Result", type: "select", required: true, options: ["Satisfactory", "Not Satisfactory"] },
      { field_id: "assessor_signature", label: "Assessor Signature", type: "signature", required: true },
      { field_id: "assessor_feedback", label: "Assessor Feedback/Comments", type: "textarea", required: false }
    ]
  }
];