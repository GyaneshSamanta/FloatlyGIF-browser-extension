/**
 * Floating Meme – Popup Script (v1.1)
 *
 * Handles:
 * - Category selection (lizard / elmo / custom) with instant feedback
 * - Custom GIF upload via FileReader
 * - Size slider with debounced persistence
 * - Sends messages to ALL open tabs for immediate GIF response
 * - All settings persisted via chrome.storage.local
 */

(function () {
  'use strict';

  // ─── DOM Elements ───
  const categoryRadios = document.querySelectorAll('input[name="category"]');
  const uploadSection = document.getElementById('upload-section');
  const uploadArea = document.getElementById('upload-area');
  const gifUploadInput = document.getElementById('gif-upload');
  const uploadPlaceholder = document.getElementById('upload-placeholder');
  const uploadPreview = document.getElementById('upload-preview');
  const sizeSlider = document.getElementById('size-slider');
  const sizeValue = document.getElementById('size-value');

  // ─── Debounce Utility ───
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ─── Show a brief "Applied!" toast on the popup ───
  function showAppliedFeedback() {
    // Remove any existing toast
    const existing = document.getElementById('applied-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'applied-toast';
    toast.textContent = '✓ Applied!';
    toast.style.cssText = `
      position: fixed;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: #6c5ce7;
      color: #fff;
      padding: 6px 18px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 4px 16px rgba(108, 92, 231, 0.3);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.25s ease;
    `;
    document.body.appendChild(toast);

    // Fade in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });

    // Fade out and remove after 1.5s
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 1500);
  }

  // ─── Send message to ALL open tabs to trigger immediate GIF update ───
  function notifyAllTabs(message) {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        // Skip extension pages and chrome:// pages
        if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://'))) {
          continue;
        }
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Tab may not have content script injected yet — that's fine
        });
      }
    });
  }

  // ─── Initialize: Load saved settings ───
  function init() {
    chrome.storage.local.get(['category', 'gifSize', 'customGifDataUrl'], (data) => {
      // Restore category
      const savedCategory = data.category || 'lizard';
      const radio = document.querySelector(`input[name="category"][value="${savedCategory}"]`);
      if (radio) radio.checked = true;

      // Show/hide upload section
      toggleUploadSection(savedCategory === 'custom');

      // Restore custom preview
      if (data.customGifDataUrl) {
        showUploadPreview(data.customGifDataUrl);
      }

      // Restore size
      const savedSize = data.gifSize || 150;
      sizeSlider.value = savedSize;
      sizeValue.textContent = savedSize + 'px';
    });
  }

  // ─── Category Change Handler ───
  categoryRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const category = e.target.value;
      chrome.storage.local.set({ category });
      toggleUploadSection(category === 'custom');

      // Immediate feedback: tell all tabs to play hello animation
      if (category !== 'custom') {
        notifyAllTabs({ type: 'playHello', category });
        showAppliedFeedback();
      }
    });
  });

  function toggleUploadSection(show) {
    uploadSection.style.display = show ? 'block' : 'none';
  }

  // ─── Custom GIF Upload ───
  uploadArea.addEventListener('click', () => {
    gifUploadInput.click();
  });

  gifUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.includes('gif')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      chrome.storage.local.set({ customGifDataUrl: dataUrl });
      showUploadPreview(dataUrl);
      showAppliedFeedback();

      // Notify tabs to show custom GIF immediately
      notifyAllTabs({ type: 'showCustom', customGifDataUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  });

  function showUploadPreview(dataUrl) {
    uploadPreview.src = dataUrl;
    uploadPreview.style.display = 'block';
    uploadPlaceholder.style.display = 'none';
  }

  // ─── Size Slider ───
  sizeSlider.addEventListener('input', (e) => {
    const size = parseInt(e.target.value, 10);
    sizeValue.textContent = size + 'px';
    debouncedSaveSize(size);
  });

  const debouncedSaveSize = debounce((size) => {
    chrome.storage.local.set({ gifSize: size });
    // Notify all tabs immediately about size change
    notifyAllTabs({ type: 'resizeGif', gifSize: size });
  }, 300);

  // ─── Run ───
  init();
})();
