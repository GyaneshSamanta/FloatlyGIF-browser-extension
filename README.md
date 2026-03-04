# 🦎 Lizard Browser Extension — Your GIF-Powered Web Companion

A playful Chrome extension that displays dynamic, interactive animated GIFs as you browse. Watch as your favorite characters respond to your typing speed and stay engaged even when you're inactive!

---

## ✨ Features

- **🚀 Floating Overlays** — Non-intrusive, premium animations that float above your content.
- **🦎 Smart Categories** — Choose between **Lizard** or **Elmo**, each with unique animation states.
- **⚡ Performance Tracking** — Real-time typing speed (WPM) detection that triggers "high-speed" animations.
- **🎁 Surprise Moments** — Fun inactivity triggers to keep the browsing experience alive.
- **🎨 Custom GIF Support** — Upload your own favorites and customize their size to fit your style.
- **💾 Persistent Settings** — Preferences saved automatically using `chrome.storage`.

---

## �️ Installation Guide

Follow these simple steps to install the extension manually and start your GIF journey:

### 1. Download the Extension
Clone this repository to your local machine:
```bash
git clone https://github.com/GyaneshSamanta/Lizard-browser-extension.git
```
Alternatively, download the [source code as a ZIP](https://github.com/GyaneshSamanta/Lizard-browser-extension/archive/refs/heads/main.zip) and extract it.

### 2. Open Chrome Extensions
Navigate to the extensions manager by typing this in your address bar:
`chrome://extensions/`

### 3. Enable Developer Mode
Toggle the **Developer mode** switch in the top-right corner to allow manual installs.
![Enabling Developer Mode](Installation%20images/Enabling%20developer%20mode%20in%20chrome%20extensions.png)

### 4. Load the Extension
Click the **Load unpacked** button and select the root directory where you cloned/extracted the extension.
![Load Unpacked](Installation%20images/load%20unpacked.png)

*The extension is now installed! You can find the 🦎 icon in your toolbar.*

### **Meet the Lizard 🦎**

<p align="center">
  <img src="Assets/Lizard/FirstGif.gif" width="300" alt="Lizard Intro" />
  <img src="Assets/Lizard/NormalSpeed.gif" width="300" alt="Lizard Normal" />
  <br />
  <em>The Lizard in action — from a friendly hi to a focused browsing partner.</em>
</p>

---

## 🎮 How It Works

### **Adaptive Animations**
| State | Preview | Behavior |
| :--- | :---: | :--- |
| **Intro** | ![Intro](Assets/Lizard/FirstGif.gif) | Plays a welcoming animation on page load. |
| **Idle** | ![Idle](Assets/Lizard/NormalSpeed.gif) | Transitions to a calm, default GIF after 3 seconds. |
| **Active** | ![High Speed](Assets/Lizard/HighSpeed.gif) | Detects typing speed. If > 40 WPM, a high-energy GIF appears! |
| **Inactivity** | ![Inactivity](Assets/Lizard/HighSpeed.gif) | Shows a surprise animation if no activity is detected for 10 seconds. |

### **Custom Content**
Upload any GIF via the popup UI to replace the default animations with your own personalized loops.

---

## 🍵 Buy Me A Chai

If you're enjoying the 🦎 Lizard Browser Extension, consider supporting its development!

Any proceeds from this will go directly towards purchasing a **Chrome Web Store Extension License**, allowing me to publish this officially for everyone to enjoy with a single click.

[![Buy Me A Chai](https://buymeachai.ezee.li/assets/images/buymeachai-button.png)](https://buymeachai.ezee.li/GyaneshOnProduct)

---

## 👤 Author

**Gyanesh Samanta**

- [GitHub](https://github.com/GyaneshSamanta)
- [LinkedIn — Gyanesh on Product](https://www.linkedin.com/newsletters/gyanesh-on-product-6979386586404651008/)
- [Buy Me A Chai](https://buymeachai.ezee.li/GyaneshOnProduct)
