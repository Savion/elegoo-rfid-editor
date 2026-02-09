import {
  MATERIAL_CODES,
  MATERIAL_CODES_REVERSE,
  SUBTYPE_CODES,
  SUBTYPE_CODES_REVERSE,
} from './materials';
import type { SpoolData, ValidationResult } from './types';

const INTERNAL_BASE = new Uint8Array([
  0x53, 0x44, 0xE5, 0x7A, 0x01, 0xA0, 0x00, 0x04, 0xA5, 0x48, 0x00, 0x00, 0xE1, 0x10, 0x12, 0x00,
  0x01, 0x03, 0xA0, 0x0C, 0x34, 0x03, 0x0F, 0xD1, 0x01, 0x0B, 0x55, 0x02, 0x65, 0x6C, 0x65, 0x67,
  0x6F, 0x6F, 0x2E, 0x63, 0x6F, 0x6D, 0xFE, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x36, 0xEE, 0xEE, 0xEE, 0xEE, 0x00, 0x00, 0x00, 0x00, 0x80, 0x76, 0x65, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0xFF, 0x00, 0xBE, 0x00, 0xE6, 0x00, 0x00, 0x00, 0x00, 0x00, 0xAF, 0x03, 0xE8,
  0x00, 0x36, 0xC8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0xBD, 0x04, 0x00, 0x00,
]);

export class ElegooSpool {
  private data: Uint8Array;

  constructor(data?: Uint8Array) {
    if (!data || data.length === 0 || data.every((b) => b === 0)) {
      this.data = new Uint8Array(INTERNAL_BASE);
    } else {
      if (data.length < 180) {
        const newData = new Uint8Array(180);
        newData.set(data);
        this.data = newData;
      } else {
        this.data = new Uint8Array(data);
      }
    }
  }

  // Material (0x48-0x4B)
  get material(): string {
    const code = this.read32BitBE(0x48);
    return MATERIAL_CODES[code] || 'Unknown';
  }

  set material(value: string) {
    const code = MATERIAL_CODES_REVERSE[value];
    if (code !== undefined) {
      this.write32BitBE(0x48, code);
    }
  }

  // Subtype (0x4C-0x4D)
  get subtypeCode(): number {
    return this.read16BitBE(0x4C);
  }

  set subtypeCode(value: number) {
    this.write16BitBE(0x4C, value);
  }

  get subtype(): string {
    const code = this.subtypeCode;
    return SUBTYPE_CODES[code] || `Unknown (0x${code.toString(16).padStart(4, '0')})`;
  }

  set subtype(value: string) {
    const code = SUBTYPE_CODES_REVERSE[value];
    if (code !== undefined) {
      this.subtypeCode = code;
    }
  }

  // Color (0x50-0x52)
  get color(): { r: number; g: number; b: number } {
    return {
      r: this.data[0x50],
      g: this.data[0x51],
      b: this.data[0x52],
    };
  }

  set color(value: { r: number; g: number; b: number }) {
    this.data[0x50] = value.r;
    this.data[0x51] = value.g;
    this.data[0x52] = value.b;
  }

  // Color Modifier (0x53)
  get colorModifier(): string {
    return String.fromCharCode(this.data[0x53]);
  }

  set colorModifier(value: string) {
    this.data[0x53] = value.charCodeAt(0);
  }

  // Min Temperature (0x54-0x55)
  get minTemp(): number {
    return this.read16BitBE(0x54);
  }

  set minTemp(value: number) {
    this.write16BitBE(0x54, value);
  }

  // Max Temperature (0x56-0x57)
  get maxTemp(): number {
    return this.read16BitBE(0x56);
  }

  set maxTemp(value: number) {
    this.write16BitBE(0x56, value);
  }

  // Diameter (0x5C-0x5D)
  get diameter(): number {
    return this.read16BitBE(0x5C);
  }

  set diameter(value: number) {
    this.write16BitBE(0x5C, value);
  }

  // Weight (0x5E-0x5F)
  get weight(): number {
    return this.read16BitBE(0x5E);
  }

  set weight(value: number) {
    this.write16BitBE(0x5E, value);
  }

  // Production Date (0x60-0x61)
  get productionDate(): string {
    const encoded = this.read16BitBE(0x60);
    return encoded.toString().padStart(4, '0');
  }

  set productionDate(value: string) {
    const encoded = parseInt(value);
    if (!isNaN(encoded)) {
      this.write16BitBE(0x60, encoded);
    }
  }

  // Manufacturer (0x41-0x44)
  get manufacturer(): string {
    const code = this.read32BitBE(0x41);
    if (code === 0xEEEEEEEE) return 'ELEGOO';
    if (code === 0x00000000 || code === 0xFFFFFFFF) return '--';
    return 'Generic';
  }

  // Generate new UID
  generateNewIdentity(): void {
    const newUid = new Uint8Array(7);
    crypto.getRandomValues(newUid);

    this.data[0] = newUid[0];
    this.data[1] = newUid[1];
    this.data[2] = newUid[2];
    this.data[3] = 0x88 ^ this.data[0] ^ this.data[1] ^ this.data[2];

    this.data[4] = newUid[3];
    this.data[5] = newUid[4];
    this.data[6] = newUid[5];
    this.data[7] = newUid[6];

    this.data[8] = this.data[4] ^ this.data[5] ^ this.data[6] ^ this.data[7];
  }

  // Fix checksums
  fixChecksums(): void {
    this.data[0x08] = this.data[0x04] ^ this.data[0x05] ^ this.data[0x06] ^ this.data[0x07];
  }

  // Validate tag
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check size
    if (this.data.length !== 180) {
      errors.push(`Invalid size: ${this.data.length} bytes (expected 180)`);
    }

    // Check BCC1 checksum
    const expectedBCC1 = this.data[0x04] ^ this.data[0x05] ^ this.data[0x06] ^ this.data[0x07];
    if (this.data[0x08] !== expectedBCC1) {
      errors.push('BCC1 checksum mismatch');
    }

    // Check material code
    if (this.material === 'Unknown') {
      warnings.push('Unknown material code');
    }

    // Check subtype code
    if (this.subtype.startsWith('Unknown')) {
      warnings.push('Unknown subtype code');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Export to Blob
  toBlob(): Blob {
    return new Blob([this.data], { type: 'application/octet-stream' });
  }

  // Export mobile commands
  exportMobileCommands(): string {
    const commands: string[] = [];
    for (let page = 4; page <= 44; page++) {
      const offset = page * 4;
      const hex = Array.from(this.data.slice(offset, offset + 4))
        .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
        .join('');
      commands.push(`A2:${page.toString(16).padStart(2, '0').toUpperCase()}:${hex}`);
    }
    return commands.join(', ');
  }

  // Export clean hex
  exportHex(): string {
    return Array.from(this.data)
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join('');
  }

  // Get all data as SpoolData
  toSpoolData(): SpoolData {
    return {
      material: this.material,
      subtype: this.subtype,
      color: this.color,
      weight: this.weight,
      diameter: this.diameter,
      minTemp: this.minTemp,
      maxTemp: this.maxTemp,
      productionDate: this.productionDate,
      modifier: this.colorModifier,
      manufacturer: this.manufacturer,
    };
  }

  // Get raw data
  getRawData(): Uint8Array {
    return this.data;
  }

  // Helper methods
  private read16BitBE(offset: number): number {
    return (this.data[offset] << 8) | this.data[offset + 1];
  }

  private write16BitBE(offset: number, value: number): void {
    this.data[offset] = (value >> 8) & 0xFF;
    this.data[offset + 1] = value & 0xFF;
  }

  private read32BitBE(offset: number): number {
    return (
      ((this.data[offset] << 24) |
      (this.data[offset + 1] << 16) |
      (this.data[offset + 2] << 8) |
      this.data[offset + 3]) >>> 0
    );
  }

  private write32BitBE(offset: number, value: number): void {
    this.data[offset] = (value >> 24) & 0xFF;
    this.data[offset + 1] = (value >> 16) & 0xFF;
    this.data[offset + 2] = (value >> 8) & 0xFF;
    this.data[offset + 3] = value & 0xFF;
  }
}
