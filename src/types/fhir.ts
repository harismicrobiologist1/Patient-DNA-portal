/**
 * HL7 FHIR Release 4 (R4) Standard Type Definitions
 * Fast Healthcare Interoperability Resources (FHIR) Specification
 * http://hl7.org/fhir/R4/
 */

export interface FHIRCoding {
  system?: string;
  code?: string;
  display?: string;
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRIdentifier {
  use?: "usual" | "official" | "temp" | "secondary";
  system?: string;
  value: string;
}

export interface FHIRHumanName {
  use?: "official" | "usual" | "nickname";
  text: string;
  family?: string;
  given?: string[];
  prefix?: string[];
}

export interface FHIRContactPoint {
  system: "phone" | "email" | "url" | "sms";
  value: string;
  use?: "home" | "work" | "mobile";
}

export interface FHIRAddress {
  use?: "home" | "work" | "billing";
  type?: "postal" | "physical" | "both";
  text?: string;
  line?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface FHIRReference {
  reference?: string;
  type?: string;
  display?: string;
}

export interface FHIRQuantity {
  value: number;
  unit: string;
  system?: string;
  code?: string;
}

// FHIR Resource: Patient
export interface FHIRPatientResource {
  resourceType: "Patient";
  id: string;
  identifier: FHIRIdentifier[];
  active: boolean;
  name: FHIRHumanName[];
  telecom: FHIRContactPoint[];
  gender: "male" | "female" | "other" | "unknown";
  birthDate: string;
  address?: FHIRAddress[];
  contact?: Array<{
    relationship?: FHIRCodeableConcept[];
    name?: FHIRHumanName;
    telecom?: FHIRContactPoint[];
  }>;
  managingOrganization?: FHIRReference;
  extension?: Array<{
    url: string;
    valueString?: string;
    valueBoolean?: boolean;
    valueCodeableConcept?: FHIRCodeableConcept;
  }>;
}

// FHIR Resource: Condition
export interface FHIRConditionResource {
  resourceType: "Condition";
  id: string;
  clinicalStatus: {
    coding: FHIRCoding[];
    text?: string;
  };
  verificationStatus?: {
    coding: FHIRCoding[];
  };
  category?: FHIRCodeableConcept[];
  severity?: FHIRCodeableConcept;
  code: FHIRCodeableConcept;
  subject: FHIRReference;
  onsetDateTime?: string;
  recordedDate?: string;
  asserter?: FHIRReference;
  note?: Array<{ text: string }>;
}

// FHIR Resource: Observation (Vitals & Lab Analytes)
export interface FHIRObservationResource {
  resourceType: "Observation";
  id: string;
  status: "registered" | "preliminary" | "final" | "amended" | "corrected";
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject: FHIRReference;
  effectiveDateTime?: string;
  issued?: string;
  performer?: FHIRReference[];
  valueQuantity?: FHIRQuantity;
  valueString?: string;
  valueCodeableConcept?: FHIRCodeableConcept;
  interpretation?: FHIRCodeableConcept[];
  referenceRange?: Array<{
    low?: FHIRQuantity;
    high?: FHIRQuantity;
    text?: string;
  }>;
}

// FHIR Resource: DiagnosticReport (Scans, Imaging, & Lab Panels)
export interface FHIRDiagnosticReportResource {
  resourceType: "DiagnosticReport";
  id: string;
  status: "registered" | "partial" | "preliminary" | "final";
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject: FHIRReference;
  effectiveDateTime?: string;
  issued?: string;
  performer?: FHIRReference[];
  resultsInterpreter?: FHIRReference[];
  result?: FHIRReference[];
  conclusion?: string;
  presentedForm?: Array<{
    contentType?: string;
    url?: string;
    title?: string;
    size?: number;
  }>;
}

// FHIR Resource: MedicationRequest
export interface FHIRMedicationRequestResource {
  resourceType: "MedicationRequest";
  id: string;
  status: "active" | "on-hold" | "cancelled" | "completed" | "stopped";
  intent: "proposal" | "plan" | "order" | "original-order";
  medicationCodeableConcept: FHIRCodeableConcept;
  subject: FHIRReference;
  authoredOn?: string;
  requester?: FHIRReference;
  dosageInstruction?: Array<{
    text?: string;
    timing?: {
      repeat?: {
        frequency?: number;
        period?: number;
        periodUnit?: string;
      };
    };
    doseAndRate?: Array<{
      doseQuantity?: FHIRQuantity;
      doseString?: string;
    }>;
  }>;
  dispenseRequest?: {
    numberOfRepeatsAllowed?: number;
    expectedSupplyDuration?: {
      value: number;
      unit: string;
    };
  };
}

// FHIR Resource: Immunization
export interface FHIRImmunizationResource {
  resourceType: "Immunization";
  id: string;
  status: "completed" | "entered-in-error" | "not-done";
  vaccineCode: FHIRCodeableConcept;
  patient: FHIRReference;
  occurrenceDateTime: string;
  primarySource?: boolean;
  lotNumber?: string;
  performer?: Array<{
    actor: FHIRReference;
  }>;
  protocolApplied?: Array<{
    doseNumberString?: string;
    series?: string;
  }>;
}

// FHIR Resource: Procedure
export interface FHIRProcedureResource {
  resourceType: "Procedure";
  id: string;
  status: "preparation" | "in-progress" | "not-done" | "on-hold" | "stopped" | "completed";
  code: FHIRCodeableConcept;
  subject: FHIRReference;
  performedDateTime?: string;
  performer?: Array<{
    actor: FHIRReference;
  }>;
  outcome?: FHIRCodeableConcept;
  note?: Array<{ text: string }>;
}

// FHIR Resource: AllergyIntolerance
export interface FHIRAllergyIntoleranceResource {
  resourceType: "AllergyIntolerance";
  id: string;
  clinicalStatus: {
    coding: FHIRCoding[];
    text?: string;
  };
  verificationStatus?: {
    coding: FHIRCoding[];
  };
  type?: "allergy" | "intolerance";
  category?: Array<"food" | "medication" | "environment" | "biologic">;
  criticality?: "low" | "high" | "unable-to-assess";
  code: FHIRCodeableConcept;
  patient: FHIRReference;
  onsetDateTime?: string;
  reaction?: Array<{
    manifestation: FHIRCodeableConcept[];
    severity?: "mild" | "moderate" | "severe";
  }>;
}

export type AnyFHIRResource =
  | FHIRPatientResource
  | FHIRConditionResource
  | FHIRObservationResource
  | FHIRDiagnosticReportResource
  | FHIRMedicationRequestResource
  | FHIRImmunizationResource
  | FHIRProcedureResource
  | FHIRAllergyIntoleranceResource;

export interface FHIRBundleEntry {
  fullUrl: string;
  resource: AnyFHIRResource;
}

export interface FHIRBundle {
  resourceType: "Bundle";
  id: string;
  meta: {
    lastUpdated: string;
    profile?: string[];
  };
  type: "collection" | "document" | "transaction" | "batch";
  total: number;
  entry: FHIRBundleEntry[];
}
