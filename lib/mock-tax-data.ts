import type { ExtractedField, RegimeRow } from "@/types/tax";

export const extractedFields: ExtractedField[] = [
  {
    id: "gross-salary",
    label: "Gross Salary",
    value: 1850000,
    source: "Form 16",
    confidence: "high",
    formula: "Basic + HRA + Special Allowance + Bonus",
    explanation: "This is your total salary before deductions and exemptions, extracted from Part B of Form 16."
  },
  {
    id: "tds",
    label: "TDS Deducted",
    value: 186500,
    source: "Form 26AS",
    confidence: "high",
    formula: "Sum of tax deducted by employer",
    explanation: "This is the tax already deducted by your employer and deposited against your PAN."
  },
  {
    id: "hra",
    label: "HRA Exemption",
    value: 168000,
    source: "Form 16",
    confidence: "medium",
    formula: "Minimum of eligible HRA calculations",
    explanation: "HRA exemption depends on actual rent, salary, HRA received, and city type. Please verify rent details."
  },
  {
    id: "pf",
    label: "Employee PF",
    value: 72000,
    source: "Form 16",
    confidence: "high",
    formula: "Monthly PF contribution × 12",
    explanation: "Employee provident fund contribution can count under Section 80C in the old regime."
  },
  {
    id: "nps",
    label: "NPS Contribution",
    value: 50000,
    source: "Manual",
    confidence: "low",
    formula: "Self-declared NPS contribution",
    explanation: "NPS may provide additional deduction under Section 80CCD(1B) in the old regime."
  }
];

export const regimeRows: RegimeRow[] = [
  { category: "Gross Income", oldRegime: 1850000, newRegime: 1850000, note: "Same income considered in both regimes." },
  { category: "Standard Deduction", oldRegime: 50000, newRegime: 75000, note: "New regime includes enhanced standard deduction where applicable." },
  { category: "Deductions", oldRegime: 290000, newRegime: 0, note: "Most deductions are not available in the new regime." },
  { category: "Tax Liability", oldRegime: 242000, newRegime: 214000, note: "Estimated before cess and final validation." }
];
