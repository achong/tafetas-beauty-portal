// app/src/data/forms.ts
import type { Form } from '@/types';

export const SERVICE_FORMS: Form[] = [
  // 1. EXISTING FACIAL FORM
  {
    form_id: "form_facial_basic",
    service_id: "facial_basic",
    title: "Facial Treatment Consent & Consultation",
    description: "Please complete this form before your appointment.",
    is_required: true,
    created_at: new Date().toISOString(),
    fields: [
      { field_id: "full_name", label: "Full Legal Name", type: "text", required: true, placeholder: "Jane Doe" },
      { field_id: "dob", label: "Date of Birth", type: "date", required: true },
      { field_id: "allergies", label: "Do you have any known allergies? (e.g., nuts, latex, skincare ingredients)", type: "textarea", required: true, placeholder: "List any allergies here, or type 'None'." },
      { field_id: "pregnant", label: "Are you currently pregnant or breastfeeding?", type: "select", required: true, options: ["Yes, pregnant", "Yes, breastfeeding", "No", "Prefer not to say"] },
      { field_id: "consent", label: "I consent to the facial treatment and understand the aftercare instructions.", type: "checkbox", required: true }
    ]
  },

  // 2. HAIR CONSULTATION FORM
  {
    form_id: "form_hair_consultation",
    service_id: "hair_consultation",
    title: "Hairdressing Client Consultation Form",
    description: "Please complete this form to help us understand your hair history and achieve the best results.",
    is_required: true,
    created_at: new Date().toISOString(),
    fields: [
      { field_id: "name", label: "Full Name", type: "text", required: true, placeholder: "Jane Doe" },
      { field_id: "address", label: "Address", type: "text", required: true },
      { field_id: "email", label: "Email", type: "text", required: true },
      { field_id: "mobile", label: "Mobile Phone", type: "text", required: true },
      { 
        field_id: "medical_history", 
        label: "Medical History", 
        type: "textarea", 
        required: true,
        placeholder: "Please list if you suffer from: Eczema, Psoriasis, Alopecia, Migraines, Allergies, Recent surgery, or if you are pregnant/breastfeeding. Type 'None' if not applicable."
      },
      {
        field_id: "hair_concerns",
        label: "Hair & Scalp Concerns",
        type: "textarea",
        required: true,
        placeholder: "e.g., Dry hair, Oily scalp, Damaged hair, Dandruff, Itchy scalp, Hair loss."
      },
      {
        field_id: "chemical_history",
        label: "Chemical History",
        type: "textarea",
        required: true,
        placeholder: "Is your hair coloured or bleached? How often? When was it last done? Have you had any chemical reformation services?"
      },
      {
        field_id: "hair_care_regime",
        label: "Hair Care Regime",
        type: "textarea",
        required: true,
        placeholder: "Products currently used, heat tool frequency, sun/chlorine exposure, and if you have hair extensions."
      },
      {
        field_id: "service_goal",
        label: "Service Goal",
        type: "textarea",
        required: true,
        placeholder: "What are you hoping to achieve from your service today?"
      },
      {
        field_id: "client_agreement",
        label: "I certify that all of the information I have given on this form is accurate.",
        type: "checkbox",
        required: true
      },
      {
        field_id: "client_signature",
        label: "Client Signature",
        type: "signature",
        required: true
      }
    ]
  },

  // 3. HAIR CUT SERVICE PLAN
  {
    form_id: "form_hair_cut",
    service_id: "hair_cut",
    title: "Hair Cut Service Plan",
    description: "To be completed with your stylist to ensure your desired haircut is achieved.",
    is_required: true,
    created_at: new Date().toISOString(),
    fields: [
      {
        field_id: "hair_characteristics",
        label: "Hair Characteristics",
        type: "textarea",
        required: true,
        placeholder: "Hair Type (Oily/Dry/Normal), Texture (Fine/Medium/Coarse), Density (Thin/Average/Thick), Length, Condition, and Scalp Condition."
      },
      {
        field_id: "hair_shape_patterns",
        label: "Hair Shape & Growth Patterns",
        type: "textarea",
        required: true,
        placeholder: "Movement (Straight/Wavy/Curly), Face Shape, and any growth patterns (e.g., cowlicks, widow's peak)."
      },
      {
        field_id: "cutting_techniques",
        label: "Planned Cutting Techniques (Stylist to complete)",
        type: "textarea",
        required: false,
        placeholder: "e.g., Blunt cutting, Notching, Slicing, Point cutting, Overcomb, Graduation."
      },
      {
        field_id: "client_agreement",
        label: "I agree to the proposed haircut service.",
        type: "checkbox",
        required: true
      },
      {
        field_id: "client_signature",
        label: "Client Signature",
        type: "signature",
        required: true
      }
    ]
  },

  // 4. CHEMICAL REFORMATION SERVICE PLAN
  {
    form_id: "form_hair_chemical_reformation",
    service_id: "hair_chemical_reformation",
    title: "Chemical Reformation Service Plan",
    description: "Required for all chemical straightening, perming, or smoothing services.",
    is_required: true,
    created_at: new Date().toISOString(),
    fields: [
      {
        field_id: "contraindications",
        label: "Contraindications",
        type: "textarea",
        required: true,
        placeholder: "Do you have any contraindications to this service? (If yes, please provide details)."
      },
      {
        field_id: "pre_service_tests",
        label: "Pre-Service Tests (Stylist to complete)",
        type: "textarea",
        required: false,
        placeholder: "Patch test date & result, Strand test date & result."
      },
      {
        field_id: "client_expectations",
        label: "Expected Result",
        type: "select",
        required: true,
        options: ["Soften hair and tame frizz", "Soft, straight, smooth hair with some volume", "Pin straight hair"]
      },
      {
        field_id: "pre_treatment_analysis",
        label: "Pre-Treatment Analysis",
        type: "textarea",
        required: true,
        placeholder: "Hair type, curl pattern (Type 1-4), texture, porosity, elasticity, density, length, condition, and scalp condition."
      },
      {
        field_id: "chemical_history_reform",
        label: "Chemical History (Past 5 Years)",
        type: "textarea",
        required: true,
        placeholder: "Current hair colour (Natural/Artificial), products used to colour/lighten, and any previous chemical reformation treatments."
      },
      {
        field_id: "client_agreement",
        label: "I agree to the proposed chemical reformation service.",
        type: "checkbox",
        required: true
      },
      {
        field_id: "client_signature",
        label: "Client Signature",
        type: "signature",
        required: true
      }
    ]
  },

  // 5. COLOUR SERVICE PLAN
  {
    form_id: "form_hair_colour",
    service_id: "hair_colour",
    title: "Colour Service Plan",
    description: "Required for all hair colouring, highlighting, or bleaching services.",
    is_required: true,
    created_at: new Date().toISOString(),
    fields: [
      {
        field_id: "contraindications_colour",
        label: "Contraindications",
        type: "textarea",
        required: true,
        placeholder: "Do you have any contraindications to this hair colour service? (If yes, please provide details)."
      },
      {
        field_id: "pre_service_tests_colour",
        label: "Pre-Service Tests (Stylist to complete)",
        type: "textarea",
        required: false,
        placeholder: "Patch test date & result, Strand test date & result."
      },
      {
        field_id: "pre_treatment_analysis_colour",
        label: "Pre-Treatment Analysis",
        type: "textarea",
        required: true,
        placeholder: "Hair type, texture, porosity, elasticity, density, length, condition, scalp condition, and skin tone (Fair/Medium/Olive/Dark)."
      },
      {
        field_id: "current_hair_colour",
        label: "Current Hair Colour Details",
        type: "textarea",
        required: true,
        placeholder: "Natural or Artificial base level, colour tones (Warm/Cool/Neutral), and percentage of white hair (0%, 20%, 50%, 80%+)."
      },
      {
        field_id: "colour_history",
        label: "Colour History",
        type: "textarea",
        required: true,
        placeholder: "Current artificial colour type (All over, Highlights, Bleach, etc.), previous products used, and any other chemical treatments."
      },
      {
        field_id: "desired_colour_result",
        label: "Desired Colour Result",
        type: "textarea",
        required: true,
        placeholder: "Desired level and tones (Warm/Cool/Neutral) for regrowth, mid-lengths, and ends."
      },
      {
        field_id: "client_agreement",
        label: "I agree to the proposed colour service.",
        type: "checkbox",
        required: true
      },
      {
        field_id: "client_signature",
        label: "Client Signature",
        type: "signature",
        required: true
      }
    ]
  }
];