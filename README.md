# M4B/AAX to MP3 Converter

A modern web application that converts M4B and AAX audiobook files to separate MP3 files per chapter, with all processing happening client-side in your browser using ffmpeg.wasm.

## Features

- 🎧 **Client-Side Processing** - All conversion happens in your browser, no files are uploaded
- 📚 **Chapter Extraction** - Automatically extracts chapters from M4B metadata
- ✏️ **Edit Chapter Names** - Customize chapter titles before conversion
- 💾 **Multiple Download Options** - Download individual chapters or all as ZIP
- ⚡ **Modern Stack** - Built with React 18, TypeScript, and Vite
- 🔒 **Privacy First** - No server uploads, everything stays on your device

## Demo

![M4B Converter Screenshot](https://via.placeholder.com/800x450?text=M4B+Converter)

## How It Works

1. **Upload** an M4B or AAX audiobook file
2. **Review** extracted chapters with durations
3. **Edit** chapter names if needed (click the pencil icon)
4. **Convert** to MP3 files (128kbps)
5. **Download** individual files or all as ZIP

## Tech Stack

- **React 18.3** - UI framework
- **TypeScript 5** - Type safety
- **Vite 6** - Build tool and dev server
- **ffmpeg.wasm** - Client-side audio processing
- **JSZip** - ZIP file creation
- **file-saver** - Download handling

## Browser Compatibility

Requires browsers with SharedArrayBuffer support:
- ✅ Chrome 109+
- ✅ Firefox 110+
- ✅ Edge 109+
- ⚠️ Safari 16.4+ (limited support)

## Installation

```bash
# Clone the repository
git clone https://github.com/sregg/m4b-converter.git
cd m4b-converter

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

### Netlify

Create a `_headers` file in the `public/` directory:

```
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
```

### Vercel

Create a `vercel.json` file:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    }
  ]
}
```

## Technical Details

### Cross-Origin Isolation

ffmpeg.wasm requires SharedArrayBuffer, which needs COOP and COEP headers. The Vite dev server is configured to set these headers automatically.

### Performance

- First load downloads ~30MB of FFmpeg WASM files
- Conversion speed: ~2-5x slower than native FFmpeg
- Memory usage: Processes chapters sequentially to avoid OOM
- File size limit: 2GB (browser constraint)

### File Management

- M4B files are written to FFmpeg's virtual filesystem
- Chapters are extracted and converted sequentially
- Files are cleaned up after processing to free memory

## Known Limitations

1. **File Size** - Browser memory limits files >1GB
2. **Speed** - WASM is slower than native FFmpeg
3. **Mobile** - Limited by device memory/CPU
4. **Browser Support** - Requires SharedArrayBuffer

## Project Structure

```
src/
├── components/          # React components
│   ├── FileUpload.tsx
│   ├── ChapterList.tsx
│   ├── ProgressBar.tsx
│   ├── DownloadPanel.tsx
│   └── ErrorBoundary.tsx
├── hooks/              # Custom React hooks
│   ├── useFFmpeg.ts
│   └── useM4bProcessor.ts
├── services/           # Business logic
│   ├── chapterExtractor.ts
│   └── conversionService.ts
├── utils/              # Helper functions
│   ├── fileHelpers.ts
│   └── downloadHelpers.ts
├── types/              # TypeScript types
│   └── index.ts
└── App.tsx             # Main application
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) - FFmpeg compiled to WebAssembly
- Built with assistance from Claude Code

## Support

If you encounter issues:
1. Ensure your browser supports SharedArrayBuffer
2. Try a hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
3. Check browser console for error messages
4. Open an issue on GitHub

---

Made with ❤️ using React + TypeScript + ffmpeg.wasm
