export type Confidence = "high" | "medium" | "low";

export type ExtractedField = {
  id: string;
  label: string;
  value: number;
  source: "Form 16" | "AIS" | "Form 26AS" | "Salary Slip" | "Manual";
  confidence: Confidence;
  explanation: string;
  formula?: string;
};

export type RegimeRow = {
  category: string;
  oldRegime: number;
  newRegime: number;
  note: string;
};
