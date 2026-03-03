# 🦎 Floating Meme — Chrome Browser Extension

A playful Chrome extension that displays a floating animated GIF overlay inside the active browser window. Choose between built-in categories (**Lizard** or **Elmo**), upload your own custom GIF, and watch the animation adapt to your typing speed!

---

## ✨ Features

- **Floating GIF Overlay** — non-intrusive, decorative animation that floats above page content
- **Built-in Categories** — Lizard 🦎 and Elmo 🔥 with 3 animation states each
- **Custom GIF Upload** — use your own GIF with size customization
- **Typing Speed Detection** — animation changes based on your WPM (words per minute)
- **Inactivity Animation** — fun surprise animation when you stop interacting for 10 seconds
- **Persistent Settings** — your preferences are saved via `chrome.storage`
- **Zero Page Interference** — `pointer-events: none` ensures the GIF never blocks clicks

---

## 📁 Folder Structure

```
Lizard-browser-extension/
├── manifest.json              # Manifest V3 configuration
├── Assets/
│   ├── Elmo/
│   │   ├── FirstGif.gif       # Intro animation
│   │   ├── NormalSpeed.gif    # Default typing animation
│   │   └── HighSpeed.gif      # Fast typing / inactivity animation
│   ├── Lizard/
│   │   ├── FirstGif.gif
│   │   ├── NormalSpeed.gif
│   │   └── HighSpeed.gif
│   └── Logo/
│       ├── Product.png        # Extension icon
│       ├── GitHub.jpg
│       └── LinkedIn.png
└── src/
    ├── popup.html             # Extension popup UI
    ├── popup.css              # Popup styling
    ├── popup.js               # Popup logic & storage
    ├── content.js             # GIF overlay & typing detection
    ├── content.css            # Overlay styling
    └── background.js          # Service worker (defaults)
```

---

## 🚀 How to Install

1. **Clone or download** this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the root folder of this repository (`Lizard-browser-extension/`)
6. The extension icon will appear in your toolbar — click it to open the popup!

---

## 🎮 How It Works

### Page Load Sequence
1. When a page loads, the **intro GIF** (`FirstGif.gif`) plays once
2. After ~3 seconds, it transitions to the **normal typing GIF** (`NormalSpeed.gif`)

### Typing Speed Detection
- Measures your typing speed over a rolling 10-second window
- If WPM > 40 → the **fast typing GIF** (`HighSpeed.gif`) flashes in a random right corner
- If WPM ≤ 40 → the normal animation continues

### Inactivity
- If no keyboard or mouse activity for 10 seconds → a surprise GIF flash appears

### Custom GIF Mode
- Upload any `.gif` file via the popup
- The custom GIF loops on page load with no typing detection

---

## 🛠 Technical Details

- **Manifest V3** — modern Chrome extension standard
- **Content Scripts** — injected into every page via `document_idle`
- **chrome.storage.local** — persists user preferences
- **Performance** — debounced calculations, efficient intervals, proper cleanup on page unload
- **No external libraries** — pure vanilla JavaScript

---

## 👤 Author

**Gyanesh Samanta**

- [GitHub](https://github.com/GyaneshSamanta)
- [LinkedIn — Gyanesh on Product](https://www.linkedin.com/newsletters/gyanesh-on-product-6979386586404651008/)
