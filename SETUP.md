# Setup Guide

## Local Development

### 1. Install Dependencies

```bash
cd elegoo-rfid-web
npm install
```

This will install:
- React & React DOM
- TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)
- PWA plugin

### 2. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

Any changes you make will hot-reload automatically!

### 3. Build for Production

```bash
npm run build
```

Creates optimized production build in `dist/` folder.

### 4. Preview Production Build

```bash
npm run preview
```

Test the production build locally.

## Deploy to GitHub Pages

### Option 1: Automatic Deployment (Recommended)

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/elegoo-rfid-editor.git
   git push -u origin main
   ```

2. **Update Vite Config**

   Edit `vite.config.ts` and change the `base` to match your repo name:
   ```typescript
   base: '/elegoo-rfid-editor/', // Change this to your repo name
   ```

3. **Enable GitHub Pages**
   - Go to your repo on GitHub
   - Settings → Pages
   - Source: GitHub Actions
   - Save

4. **Push to Deploy**
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages"
   git push
   ```

   The GitHub Action will automatically build and deploy!

5. **Access Your Site**

   Visit: `https://yourusername.github.io/elegoo-rfid-editor/`

### Option 2: Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to any static hosting:
   - Netlify
   - Vercel
   - Cloudflare Pages
   - AWS S3 + CloudFront
   - etc.

## Custom Domain (Optional)

### GitHub Pages with Custom Domain

1. Add a `CNAME` file to `public/` folder:
   ```
   rfid.yourdomain.com
   ```

2. Configure DNS:
   - Add a CNAME record pointing to `yourusername.github.io`

3. In GitHub repo settings → Pages:
   - Enter your custom domain
   - Enable "Enforce HTTPS"

## Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  'elegoo-orange': '#FF6B35',  // Change to your color
  'elegoo-blue': '#004E89',    // Change to your color
}
```

### Change App Name

1. Update `package.json` → `name` field
2. Update `index.html` → `<title>` tag
3. Update `vite.config.ts` → PWA manifest

### Add Analytics

Add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## Troubleshooting

### Port Already in Use

```bash
npm run dev -- --port 3000
```

### Build Errors

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### GitHub Pages 404

Make sure:
1. `base` in `vite.config.ts` matches your repo name
2. GitHub Pages is enabled in repo settings
3. Source is set to "GitHub Actions"

### App Not Updating

Hard refresh your browser:
- Chrome/Edge: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
- Firefox: Ctrl + F5 (Windows) or Cmd + Shift + R (Mac)
- Safari: Cmd + Option + R

## Development Tips

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### Hot Module Replacement (HMR)

Vite provides instant hot reloading. Changes to:
- React components → instant update
- CSS → instant update
- Config files → requires restart

### TypeScript

The project uses strict TypeScript. If you see type errors:

```bash
npm run build
```

This will show all type errors before deployment.

### Testing in Mobile View

1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Ctrl + Shift + M)
3. Select a mobile device
4. Test responsive design

Or access from your phone on local network:
1. Find your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. On phone, visit: `http://YOUR_IP:5173`

## Next Steps

1. Test the app locally
2. Push to GitHub
3. Verify deployment
4. Share with friends!
5. Star the repo ⭐

## Need Help?

- [Open an issue](https://github.com/yourusername/elegoo-rfid-editor/issues)
- Check the [README](./README.md) for more info
- Review [Vite documentation](https://vitejs.dev/)
- Review [React documentation](https://react.dev/)

---

Happy editing! 🎉
