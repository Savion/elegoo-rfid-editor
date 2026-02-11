# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Browser-based editor for Elegoo NTAG213 NFC spool tags used in 3D printer filament spools. Built with React 18 + TypeScript + Vite + Tailwind CSS. Deployed as a PWA to GitHub Pages.

## Commands

```bash
npm run dev       # Start dev server (localhost:5173 with HMR)
npm run build     # TypeScript check + Vite production build → dist/
npm run lint      # ESLint with --max-warnings 0 (zero tolerance)
npm run preview   # Preview production build locally
```

No test framework is configured. Linting and TypeScript type-checking (`tsc`) are the primary automated checks.

## Architecture

### Data Flow

`App.tsx` is the sole state owner. It holds an `ElegooSpool` instance and a `log: string[]` activity log, passing data + handlers down to child components via props (no state management library). The `addLog()` helper appends messages and is passed as `onStatusUpdate` to child components.

**Immutability pattern for re-renders:** After mutating an `ElegooSpool` instance, a new instance must be created from the raw data to trigger React re-renders:
```typescript
spool.material = 'PLA';
setSpool(new ElegooSpool(spool.getRawData()));
```

### Core Library (`src/lib/`)

- **`ElegooSpool.ts`** — Central class wrapping a 180-byte `Uint8Array` representing an NTAG213 memory dump. Properties are getters/setters over specific byte offsets using big-endian encoding. Key offsets: material (0x48), subtype (0x4C), color (0x50-0x52), temps (0x54-0x57), diameter (0x5C), weight (0x5E), date (0x60).
- **`materials.ts`** — Bidirectional lookup maps between 32-bit material codes and names, plus subtype codes organized by material family (0x00-0x0E prefix). Includes `getMaterialForSubtype()` for reverse-looking up the parent material family from a subtype name.
- **`manufacturerColors.ts`** — Color catalogs for 19 manufacturers (~2900+ colors). Structure: `ManufacturerCatalog` → `MaterialColorSet` → `ManufacturerColor { name, hex }`. Brands include ELEGOO, OVERTURE, HATCHBOX, Bambu Lab, Polymaker, Prusament, eSUN, SUNLU, and more.
- **`types.ts`** — Shared TypeScript interfaces (`SpoolData`, `ValidationResult`, `MaterialInfo`, `SubtypeInfo`).

### Components (`src/components/`)

Mostly stateless functional components, each handling one UI concern:

- `MaterialSelector`, `SubtypeSelector` — Material/subtype dropdowns (side by side on mobile)
- `ColorPicker` — RGB picker, hex input, Centauri Carbon 2 presets, and manufacturer color catalog (selecting a catalog color fires `onCatalogSelect` which auto-sets material + subtype + color)
- `MetadataFields` — Weight, diameter (displayed in mm, stored as ×100), min/max temp
- `FileUpload`, `ExportButtons` — File I/O and export (Mobile commands, Hex, Share)
- `HexEditor` — Read-only hex dump, toggled via button
- `NfcReaderWriter` — Web NFC read/write for Chrome Android (writes NDEF unknown-type record with spool data at offset 0x40)
- `ActivityLog` — Collapsible console-style footer showing all action history (replaces old StatusBar)
- `Header` — App title and version

### Export Formats

- **Mobile commands** — `A2:XX:YYYYYYYY` write commands (pages 4-44), skipping all-zero pages
- **Hex** — Raw uppercase hex string of all 180 bytes
- **Binary** — `.bin` file download via Blob URL

## Key Conventions

- Strict TypeScript (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`)
- Tailwind utility classes for all styling; custom colors `elegoo-orange` (#FF6B35) and `elegoo-blue` (#004E89) defined in `tailwind.config.js`
- All binary data is big-endian
- UID checksums: BCC0 = `0x88 ^ UID[0] ^ UID[1] ^ UID[2]`, BCC1 = `UID[4] ^ UID[5] ^ UID[6] ^ UID[7]`
- GitHub Pages deployment via `.github/workflows/deploy.yml`; base path is `/elegoo-rfid-editor/` in `vite.config.ts`
