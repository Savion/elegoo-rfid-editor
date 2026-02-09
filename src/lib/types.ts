export interface MaterialInfo {
  name: string;
  code: number;
}

export interface SubtypeInfo {
  code: number;
  name: string;
  family: number;
}

export interface SpoolData {
  material: string;
  subtype: string;
  color: { r: number; g: number; b: number };
  weight: number;
  diameter: number;
  minTemp: number;
  maxTemp: number;
  productionDate: string;
  modifier: string;
  manufacturer: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
