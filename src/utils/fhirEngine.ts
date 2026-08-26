/**
 * HL7 FHIR Release 4 (R4) Transformation & Validation Engine
 * Converts native Health DNA patient databases into standard FHIR resources:
 * - Patient
 * - Condition
 * - Observation (Vitals, Lab numeric analytes)
 * - DiagnosticReport (Scans & Lab panels)
 * - MedicationRequest
 * - Immunization
 * - Procedure
 * - AllergyIntolerance
 */

import {
  PatientProfile,
  MedicalHistory,
  ClinicalRecord,
  LabReport,
  Prescription,
  GeneticMarker,
} from "../types";
import {
  FHIRBundle,
  FHIRBundleEntry,
  FHIRPatientResource,
  FHIRConditionResource,
  FHIRObservationResource,
  FHIRDiagnosticReportResource,
  FHIRMedicationRequestResource,
  FHIRImmunizationResource,
  FHIRProcedureResource,
  FHIRAllergyIntoleranceResource,
} from "../types/fhir";

export function convertToFHIRBundle(
  patient: PatientProfile,
  history?: MedicalHistory,
  clinicalRecords: ClinicalRecord[] = [],
  labReports: LabReport[] = [],
  prescriptions: Prescription[] = [],
  geneticMarkers: GeneticMarker[] = []
): FHIRBundle {
  const entries: FHIRBundleEntry[] = [];
  const patientRefId = `Patient/${patient.dnaId.replace(/[^a-zA-Z0-9-]/g, "")}`;
  const now = new Date().toISOString();

  // 1. Patient Resource
  const fhirPatient: FHIRPatientResource = {
    resourceType: "Patient",
    id: patient.dnaId.replace(/[^a-zA-Z0-9-]/g, ""),
    active: true,
    identifier: [
      {
        use: "official",
        system: "urn:oid:healthdna:patient-dna-id",
        value: patient.dnaId,
      },
      {
        use: "secondary",
        system: "urn:oid:us:national-id",
        value: patient.nationalId,
      },
    ],
    name: [
      {
        use: "official",
        text: patient.fullName,
        family: patient.fullName.split(" ").slice(-1)[0] || "",
        given: patient.fullName.split(" ").slice(0, -1),
      },
    ],
    telecom: [
      {
        system: "phone",
        value: patient.phone,
        use: "mobile",
      },
      {
        system: "email",
        value: patient.email,
        use: "home",
      },
    ],
    gender:
      patient.gender.toLowerCase() === "male"
        ? "male"
        : patient.gender.toLowerCase() === "female"
        ? "female"
        : "unknown",
    birthDate: patient.dob,
    address: [
      {
        use: "home",
        text: patient.address,
      },
    ],
    contact: (patient.emergencyContacts || []).map((ec) => ({
      relationship: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0131",
              code: "C",
              display: "Emergency Contact",
            },
          ],
          text: ec.relationship,
        },
      ],
      name: {
        text: ec.name,
      },
      telecom: [
        {
          system: "phone",
          value: ec.phone,
        },
      ],
    })),
    managingOrganization: {
      display: patient.registeredHospital,
    },
    extension: [
      {
        url: "http://healthdna.org/fhir/StructureDefinition/blood-group",
        valueString: patient.bloodGroup,
      },
      {
        url: "http://healthdna.org/fhir/StructureDefinition/organ-donor",
        valueBoolean: patient.organDonorStatus,
      },
      {
        url: "http://healthdna.org/fhir/StructureDefinition/insurance-provider",
        valueString: patient.insurance?.provider,
      },
    ],
  };

  entries.push({
    fullUrl: `urn:uuid:${fhirPatient.id}`,
    resource: fhirPatient,
  });

  // 2. Conditions (Diagnoses & Chronic Illnesses)
  if (history?.diseases) {
    history.diseases.forEach((dis, idx) => {
      const condResource: FHIRConditionResource = {
        resourceType: "Condition",
        id: `condition-${dis.id || idx}`,
        clinicalStatus: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
              code: dis.status.toLowerCase() === "resolved" ? "resolved" : "active",
              display: dis.status,
            },
          ],
          text: dis.status,
        },
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/condition-category",
                code: "encounter-diagnosis",
                display: "Encounter Diagnosis",
              },
            ],
          },
        ],
        severity: {
          text: dis.severity,
        },
        code: {
          text: dis.name,
        },
        subject: {
          reference: patientRefId,
          display: patient.fullName,
        },
        onsetDateTime: dis.diagnosedDate,
        asserter: {
          display: dis.doctor,
        },
      };
      entries.push({
        fullUrl: `urn:uuid:${condResource.id}`,
        resource: condResource,
      });
    });
  }

  // 3. AllergyIntolerance
  if (history?.allergies) {
    history.allergies.forEach((alg, idx) => {
      const allergyResource: FHIRAllergyIntoleranceResource = {
        resourceType: "AllergyIntolerance",
        id: `allergy-${alg.id || idx}`,
        clinicalStatus: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
              code: "active",
              display: "Active",
            },
          ],
        },
        type: "allergy",
        criticality: alg.severity === "Critical" ? "high" : "low",
        code: {
          text: alg.allergen,
        },
        patient: {
          reference: patientRefId,
          display: patient.fullName,
        },
        onsetDateTime: alg.onsetDate,
        reaction: [
          {
            manifestation: [
              {
                text: alg.reaction,
              },
            ],
            severity: alg.severity.toLowerCase() === "critical" || alg.severity.toLowerCase() === "severe" ? "severe" : "moderate",
          },
        ],
      };
      entries.push({
        fullUrl: `urn:uuid:${allergyResource.id}`,
        resource: allergyResource,
      });
    });
  }

  // 4. Immunizations
  if (history?.vaccinations) {
    history.vaccinations.forEach((vac, idx) => {
      const immResource: FHIRImmunizationResource = {
        resourceType: "Immunization",
        id: `immunization-${vac.id || idx}`,
        status: "completed",
        vaccineCode: {
          text: vac.vaccine,
        },
        patient: {
          reference: patientRefId,
          display: patient.fullName,
        },
        occurrenceDateTime: vac.date,
        lotNumber: vac.batchNo,
        performer: [
          {
            actor: {
              display: vac.administeredBy,
            },
          },
        ],
        protocolApplied: [
          {
            doseNumberString: vac.doseNumber,
          },
        ],
      };
      entries.push({
        fullUrl: `urn:uuid:${immResource.id}`,
        resource: immResource,
      });
    });
  }

  // 5. Procedures (Surgeries)
  if (history?.surgeries) {
    history.surgeries.forEach((surg, idx) => {
      const procResource: FHIRProcedureResource = {
        resourceType: "Procedure",
        id: `procedure-${surg.id || idx}`,
        status: "completed",
        code: {
          text: surg.procedure,
        },
        subject: {
          reference: patientRefId,
          display: patient.fullName,
        },
        performedDateTime: surg.date,
        performer: [
          {
            actor: {
              display: `${surg.surgeon} (${surg.hospital})`,
            },
          },
        ],
        outcome: {
          text: surg.outcome,
        },
        note: surg.notes ? [{ text: surg.notes }] : undefined,
      };
      entries.push({
        fullUrl: `urn:uuid:${procResource.id}`,
        resource: procResource,
      });
    });
  }

  // 6. MedicationRequests (Prescriptions & Active Meds)
  prescriptions.forEach((rx) => {
    (rx.medicines || []).forEach((med, mIdx) => {
      const medReqResource: FHIRMedicationRequestResource = {
        resourceType: "MedicationRequest",
        id: `medreq-${rx.id}-${mIdx}`,
        status: "active",
        intent: "order",
        medicationCodeableConcept: {
          text: `${med.name} (${med.dosage})`,
        },
        subject: {
          reference: patientRefId,
          display: patient.fullName,
        },
        authoredOn: rx.date,
        requester: {
          display: `${rx.doctorName} (${rx.department})`,
        },
        dosageInstruction: [
          {
            text: `${med.frequency}. ${med.instructions || ""}`,
          },
        ],
        dispenseRequest: {
          numberOfRepeatsAllowed: med.refillAvailable ? 3 : 0,
          expectedSupplyDuration: {
            value: med.durationDays || 30,
            unit: "days",
          },
        },
      };
      entries.push({
        fullUrl: `urn:uuid:${medReqResource.id}`,
        resource: medReqResource,
      });
    });
  });

  // 7. Observations (Clinical Vitals & Lab Numeric Analytes)
  clinicalRecords.forEach((cr) => {
    if (cr.vitals) {
      if (cr.vitals.bp) {
        entries.push({
          fullUrl: `urn:uuid:obs-bp-${cr.id}`,
          resource: {
            resourceType: "Observation",
            id: `obs-bp-${cr.id}`,
            status: "final",
            category: [
              {
                coding: [
                  {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs",
                  },
                ],
              },
            ],
            code: {
              coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure panel" }],
              text: "Blood Pressure",
            },
            subject: { reference: patientRefId, display: patient.fullName },
            effectiveDateTime: cr.date,
            valueString: cr.vitals.bp,
            performer: [{ display: cr.attendingDoctor }],
          },
        });
      }

      if (cr.vitals.heartRate) {
        entries.push({
          fullUrl: `urn:uuid:obs-hr-${cr.id}`,
          resource: {
            resourceType: "Observation",
            id: `obs-hr-${cr.id}`,
            status: "final",
            code: {
              coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }],
              text: "Heart Rate",
            },
            subject: { reference: patientRefId },
            effectiveDateTime: cr.date,
            valueQuantity: {
              value: cr.vitals.heartRate,
              unit: "beats/min",
              system: "http://unitsofmeasure.org",
              code: "/min",
            },
          },
        });
      }
    }
  });

  // 8. DiagnosticReports & Lab Observations
  labReports.forEach((lab) => {
    const reportRefId = `report-${lab.id}`;
    const resultRefs = (lab.numericResults || []).map((nr, nIdx) => {
      const obsId = `obs-lab-${lab.id}-${nIdx}`;
      const numVal = parseFloat(nr.value);

      const obsResource: FHIRObservationResource = {
        resourceType: "Observation",
        id: obsId,
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "laboratory",
                display: "Laboratory",
              },
            ],
          },
        ],
        code: {
          text: nr.testItem,
        },
        subject: {
          reference: patientRefId,
          display: patient.fullName,
        },
        effectiveDateTime: lab.date,
        performer: [{ display: lab.facility }],
        referenceRange: [
          {
            text: nr.referenceRange,
          },
        ],
      };

      if (!isNaN(numVal)) {
        obsResource.valueQuantity = {
          value: numVal,
          unit: nr.unit,
        };
      } else {
        obsResource.valueString = nr.value;
      }

      entries.push({
        fullUrl: `urn:uuid:${obsId}`,
        resource: obsResource,
      });

      return {
        reference: `Observation/${obsId}`,
        display: nr.testItem,
      };
    });

    const diagReportResource: FHIRDiagnosticReportResource = {
      resourceType: "DiagnosticReport",
      id: reportRefId,
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0074",
              code: lab.category.toUpperCase().replace(/\s+/g, ""),
              display: lab.category,
            },
          ],
          text: lab.category,
        },
      ],
      code: {
        text: lab.testName,
      },
      subject: {
        reference: patientRefId,
        display: patient.fullName,
      },
      effectiveDateTime: lab.date,
      issued: now,
      performer: [
        {
          display: lab.facility,
        },
      ],
      resultsInterpreter: lab.orderedBy ? [{ display: lab.orderedBy }] : undefined,
      result: resultRefs.length > 0 ? resultRefs : undefined,
      conclusion: lab.keyFindings,
      presentedForm: lab.uploadedScanUrl
        ? [
            {
              contentType: "application/dicom",
              url: lab.uploadedScanUrl,
              title: lab.scanFileName || `${lab.category} Scan Image`,
            },
          ]
        : undefined,
    };

    entries.push({
      fullUrl: `urn:uuid:${diagReportResource.id}`,
      resource: diagReportResource,
    });
  });

  // 9. Genetic Markers (FHIR Molecular Genomics Observations)
  geneticMarkers.forEach((gm, idx) => {
    const geneObsResource: FHIRObservationResource = {
      resourceType: "Observation",
      id: `genomics-${idx}`,
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "genomics",
              display: "Molecular Genomics",
            },
          ],
        },
      ],
      code: {
        text: `Gene Variant: ${gm.gene} (${gm.variant})`,
      },
      subject: {
        reference: patientRefId,
        display: patient.fullName,
      },
      valueString: gm.trait,
      interpretation: [
        {
          text: gm.riskCategory,
        },
      ],
      referenceRange: [
        {
          text: gm.clinicalSignificance,
        },
      ],
    };
    entries.push({
      fullUrl: `urn:uuid:${geneObsResource.id}`,
      resource: geneObsResource,
    });
  });

  const bundle: FHIRBundle = {
    resourceType: "Bundle",
    id: `bundle-healthdna-${patient.dnaId.replace(/[^a-zA-Z0-9-]/g, "")}`,
    meta: {
      lastUpdated: now,
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"],
    },
    type: "collection",
    total: entries.length,
    entry: entries,
  };

  return bundle;
}

/**
 * Validates the generated FHIR Bundle against HL7 FHIR Release 4 constraints
 */
export function validateFHIRBundle(bundle: FHIRBundle): {
  valid: boolean;
  resourceCount: number;
  resourceBreakdown: Record<string, number>;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const breakdown: Record<string, number> = {};

  if (!bundle || bundle.resourceType !== "Bundle") {
    return {
      valid: false,
      resourceCount: 0,
      resourceBreakdown: {},
      errors: ["Invalid root object: Expected resourceType 'Bundle'"],
      warnings: [],
    };
  }

  if (!Array.isArray(bundle.entry)) {
    return {
      valid: false,
      resourceCount: 0,
      resourceBreakdown: {},
      errors: ["Bundle missing 'entry' array."],
      warnings: [],
    };
  }

  bundle.entry.forEach((item, idx) => {
    if (!item.resource || !item.resource.resourceType) {
      errors.push(`Entry #${idx} is missing a valid resourceType`);
      return;
    }

    const type = item.resource.resourceType;
    breakdown[type] = (breakdown[type] || 0) + 1;

    if (!item.resource.id) {
      warnings.push(`Entry #${idx} (${type}) has no unique resource id.`);
    }
  });

  const hasPatient = breakdown["Patient"] && breakdown["Patient"] > 0;
  if (!hasPatient) {
    errors.push("Bundle does not contain a root 'Patient' resource.");
  }

  return {
    valid: errors.length === 0,
    resourceCount: bundle.entry.length,
    resourceBreakdown: breakdown,
    errors,
    warnings,
  };
}

/**
 * Triggers client-side browser JSON file download of the FHIR Bundle
 */
export function downloadFHIRBundleJson(bundle: FHIRBundle, filename?: string): void {
  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: "application/fhir+json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `FHIR-R4-Bundle-${bundle.id || "export"}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
