# Elegoo RFID Tag Editor - Web Edition

A browser-based editor for Elegoo NTAG213 NFC spool tags. Edit your 3D printer filament spool RFID tags directly in your browser - works on desktop, tablet, and mobile devices!

🌐 **Live Demo:** [https://savion.github.io/elegoo-rfid-editor/](https://savion.github.io/elegoo-rfid-editor/)

## Features

✨ **No Installation Required** - Works entirely in your browser
📱 **Mobile Friendly** - Responsive design works on phones and tablets
🔒 **Privacy First** - All processing happens client-side, your data never leaves your device
💾 **Offline Capable** - Can be installed as a Progressive Web App
🎨 **Filament Color Catalog** - 2900+ colors from 19 manufacturers with auto material/subtype selection
📡 **Web NFC Support** - Read and write tags directly on Chrome Android
📤 **Multiple Export Options** - Mobile commands, clean hex, or share files
📋 **Activity Log** - Collapsible console tracking all actions

## Supported Features

### Spool Configuration
- **Material** - Select from 15 supported materials (PLA, PETG, ABS, TPU, PA, CPE, PC, PVA, ASA, BVOH, EVA, HIPS, PP, PPA, PPS)
- **Subtype** - Choose from 52 material subtypes (PLA-CF, PETG-GF, TPU 95A, etc.)
- **Filament Color** - RGB color picker with hex input and Centauri Carbon 2 color presets
- **Manufacturer Color Catalog** - Browse 2900+ colors from 19 brands (ELEGOO, Bambu Lab, Polymaker, Prusament, eSUN, SUNLU, and more). Selecting a catalog color automatically sets the material and subtype.

### Metadata Fields
- Weight (grams)
- Diameter (mm)
- Temperature Range (Min/Max in °C)

## Quick Start

### For Users

1. Visit the [live demo](https://Savion.github.io/elegoo-rfid-editor/)
2. Click **"Generate New"** to create a blank tag, or **"Load .BIN"** to edit an existing one
3. Select your **Material** and **Subtype**
4. Pick your **Filament Color** — or browse the manufacturer color catalog to auto-fill material, subtype, and color at once
5. Optionally adjust metadata fields (weight, diameter, temperatures)
6. **Export** for mobile or **Save .BIN** to your device

### On Mobile

1. Open the web app in Chrome on your Android device
2. Tap **"Add to Home Screen"** for easy access
3. Load or create your tag
4. **Option A — Web NFC (Chrome Android):** Use the built-in NFC Reader/Writer to read and write tags directly
5. **Option B — Export:** Tap **"Mobile"** to copy commands, then paste into your NFC app:
   - **Android:** RFID Tools → Other → Advanced RFID Commands
   - **iOS:** NFC Tools → Other → Advanced RFID Commands

## Development

### Prerequisites

- Node.js 18+ and npm
- A modern browser

### Installation

```bash
# Clone the repository
git clone https://github.com/Savion/elegoo-rfid-editor.git
cd elegoo-rfid-editor

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploy to GitHub Pages

1. Update `base` in `vite.config.ts` to match your repository name
2. Push to GitHub
3. Enable GitHub Pages in repository settings (Source: GitHub Actions)
4. The GitHub Action will automatically build and deploy on push to `main`

## Project Structure

```
elegoo-rfid-web/
├── src/
│   ├── components/               # React components
│   │   ├── Header.tsx
│   │   ├── FileUpload.tsx
│   │   ├── MaterialSelector.tsx
│   │   ├── SubtypeSelector.tsx
│   │   ├── ColorPicker.tsx        # Color picker + manufacturer catalog
│   │   ├── MetadataFields.tsx
│   │   ├── ExportButtons.tsx
│   │   ├── HexEditor.tsx
│   │   ├── NfcReaderWriter.tsx    # Web NFC read/write (Chrome Android)
│   │   └── ActivityLog.tsx        # Collapsible activity console
│   ├── lib/                       # Core logic
│   │   ├── ElegooSpool.ts         # Main spool data class
│   │   ├── materials.ts           # Material & subtype definitions
│   │   ├── manufacturerColors.ts  # 2900+ colors from 19 brands
│   │   └── types.ts               # TypeScript interfaces
│   ├── App.tsx                    # Main application
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Tailwind CSS
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions deployment
├── public/                        # Static assets
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## How It Works

### Binary Data Processing

The app uses native JavaScript `Uint8Array` to handle binary RFID tag data:

```typescript
// Load a .BIN file
const arrayBuffer = await file.arrayBuffer();
const uint8Array = new Uint8Array(arrayBuffer);

// Create spool object
const spool = new ElegooSpool(uint8Array);

// Edit fields
spool.material = 'PLA';
spool.subtype = 'PLA-CF';
spool.color = { r: 255, g: 0, b: 0 };

// Export
const blob = spool.toBlob();
```

### Material Encoding

Materials are encoded as 32-bit signatures:
- PLA = `0x00807665`
- PETG = `0x80698471`
- ABS = `0x00656683`
- etc.

Subtypes use 16-bit codes with family-based encoding:
- High byte = material family (0x00 = PLA, 0x01 = PETG, etc.)
- Low byte = variant (0x04 = Carbon Fiber, 0x02 = Glass Fiber, etc.)

### Checksums

The BCC1 checksum at byte 0x08 is calculated as:
```typescript
BCC1 = UID[4] ^ UID[5] ^ UID[6] ^ UID[7]
```

Checksums are automatically maintained when generating new tags.

## Export Formats

### Mobile Commands (A2 Format)
```
A2:04:01030A0C, A2:05:34030FD1, A2:06:01025502, ...
```
Copy this and paste into RFID Tools (Android) or NFC Tools (iOS) app.

### Clean Hex
```
0102030405060708EEEEEEEE00807665000400C800E6...
```
Raw hex string for apps that support direct hex input.

### Share File
On mobile devices, uses the native share sheet to send the `.bin` file directly to other apps.

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android)

### Required APIs
- File API - for loading/saving files
- Clipboard API - for copy operations
- Web Share API - for mobile sharing (optional)
- Web NFC API - for direct tag read/write on Chrome Android (optional)
- Crypto API - for random UID generation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Related Projects

- [Desktop Windows App](https://github.com/Savion/elegoo-rfid-editor-desktop) - Original C# WinForms application
- [RFID Tools (Android)](https://play.google.com/store/apps/details?id=com.wakdev.wdnfc) - Mobile NFC reader/writer app
- [NFC Tools (iOS)](https://apps.apple.com/us/app/nfc-tools/id1252962749) - Mobile NFC reader/writer app

## License

MIT License - feel free to use this project however you'd like!

## Acknowledgments

- Built with [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
- Bundled with [Vite](https://vitejs.dev/)

## Support

If you find this tool useful, please ⭐ star the repository!

For issues or questions, please [open an issue](https://github.com/Savion/elegoo-rfid-editor/issues).

---

**Note:** This tool is for educational and personal use. Make sure you have permission before modifying RFID tags.
