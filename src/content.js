/**
 * Floating Meme – Content Script (v1.1)
 *
 * Injects a floating GIF overlay into the active page.
 *
 * Behavior:
 *   Built-in category (lizard/elmo):
 *     1. On page load → play FirstGif.gif once → switch to NormalSpeed.gif (loop)
 *     2. Typing detection → if WPM > 40 → flash HighSpeed.gif in random right corner
 *     3. Inactivity (10s, no keys or mouse) → flash HighSpeed.gif, repeats every ~10s
 *     4. On category change from popup → immediately play FirstGif.gif (hello animation)
 *
 *   Custom GIF:
 *     1. On page load → show custom GIF, loop it
 *     2. No typing detection, no inactivity behavior
 */

(function () {
  'use strict';

  // ─── Guard: don't inject on extension pages or chrome:// ───
  if (
    window.location.protocol === 'chrome-extension:' ||
    window.location.protocol === 'chrome:'
  ) {
    return;
  }

  // ─── Constants ───
  const WPM_THRESHOLD = 40;
  const CHARS_PER_WORD = 5;
  const ROLLING_WINDOW_MS = 10000;       // 10-second rolling window for WPM
  const INACTIVITY_TIMEOUT_MS = 10000;    // 10 seconds of idle → trigger popup
  const INACTIVITY_CHECK_MS = 1000;       // check every 1 second
  const WPM_CALC_INTERVAL_MS = 1000;      // recalculate WPM every 1s
  const FIRST_GIF_DURATION_MS = 3000;     // how long to show FirstGif before switching
  const HIGH_SPEED_DURATION_MS = 2000;    // how long HighSpeed plays before reverting
  const DEFAULT_SIZE = 150;

  // ─── State ───
  let settings = { category: 'lizard', gifSize: DEFAULT_SIZE, customGifDataUrl: null };
  let container = null;
  let imgElement = null;
  let keypressTimestamps = [];
  let lastActivityTime = Date.now();
  let wpmCalcTimer = null;
  let inactivityTimer = null;
  let isShowingHighSpeed = false;
  let highSpeedTimeout = null;
  let firstGifTimeout = null;
  let isFirstGifPlaying = false;
  let isCustomMode = false;
  let hasEverTriggeredInactivity = false;  // Track if inactivity has fired at least once

  // ─── Category Folder Mapping ───
  const CATEGORY_MAP = {
    lizard: 'Lizard',
    elmo: 'Elmo'
  };

  // ─── Helpers ───

  /** Resolve the URL for an asset file inside the extension. */
  function getAssetUrl(category, filename) {
    const folder = CATEGORY_MAP[category];
    return chrome.runtime.getURL(`Assets/${folder}/${filename}`);
  }

  /** Pick a random right-side corner position. */
  function randomRightCorner() {
    return Math.random() < 0.5 ? 'top-right' : 'bottom-right';
  }

  /** Apply position to the container. */
  function setPosition(position) {
    container.style.top = 'auto';
    container.style.bottom = 'auto';
    container.style.left = 'auto';
    container.style.right = '20px';

    switch (position) {
      case 'top-right':
        container.style.top = '20px';
        break;
      case 'bottom-right':
      default:
        container.style.bottom = '20px';
        break;
    }
  }

  /** Apply the current size setting to the image. */
  function applySize() {
    if (imgElement) {
      imgElement.style.width = settings.gifSize + 'px';
      imgElement.style.height = 'auto';
    }
  }

  // ─── DOM Setup ───

  /** Create the overlay container and image element. */
  function createOverlay() {
    // Remove any existing overlay (e.g., from previous injection)
    const existing = document.getElementById('floating-meme-container');
    if (existing) existing.remove();

    container = document.createElement('div');
    container.id = 'floating-meme-container';

    imgElement = document.createElement('img');
    imgElement.id = 'floating-meme-img';
    imgElement.alt = 'Floating Meme';

    container.appendChild(imgElement);
    document.body.appendChild(container);

    applySize();
    setPosition('bottom-right');
  }

  // ─── GIF Playback ───

  /**
   * Force a GIF to restart by appending a cache-busting query param.
   * This makes the browser re-fetch and replay the animation from frame 1.
   */
  function setGifSrc(url) {
    const bustUrl = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
    imgElement.src = bustUrl;
  }

  /**
   * Show the FirstGif once, then transition to NormalSpeed.
   */
  function playFirstGifSequence() {
    isFirstGifPlaying = true;

    // Clear any pending first-gif timeout
    clearTimeout(firstGifTimeout);

    const firstGifUrl = getAssetUrl(settings.category, 'FirstGif.gif');
    setGifSrc(firstGifUrl);
    setPosition('bottom-right');
    container.style.opacity = '1';

    // After the intro GIF plays, switch to NormalSpeed
    firstGifTimeout = setTimeout(() => {
      isFirstGifPlaying = false;
      showNormalSpeedGif();
    }, FIRST_GIF_DURATION_MS);
  }

  /** Show the looping NormalSpeed GIF. */
  function showNormalSpeedGif() {
    if (isShowingHighSpeed || isFirstGifPlaying) return;
    const url = getAssetUrl(settings.category, 'NormalSpeed.gif');
    setGifSrc(url);
    setPosition('bottom-right');
    container.style.opacity = '1';
  }

  /**
   * Flash the HighSpeed GIF once in a random right corner.
   * After it plays, revert to NormalSpeed.
   * The activity timer is reset AFTER the animation, so the next
   * inactivity trigger is ~10s after the animation ends (≈12s total cycle).
   */
  function flashHighSpeedGif() {
    if (isShowingHighSpeed || isFirstGifPlaying || isCustomMode) return;

    isShowingHighSpeed = true;
    const url = getAssetUrl(settings.category, 'HighSpeed.gif');
    const corner = randomRightCorner();

    setGifSrc(url);
    setPosition(corner);
    container.style.opacity = '1';

    clearTimeout(highSpeedTimeout);
    highSpeedTimeout = setTimeout(() => {
      isShowingHighSpeed = false;
      showNormalSpeedGif();
      // Reset inactivity timer AFTER the animation ends
      // so the next inactivity trigger is a full 10s from now
      lastActivityTime = Date.now();
    }, HIGH_SPEED_DURATION_MS);
  }

  /** Show custom GIF — loop it, no special behaviors. */
  function showCustomGif() {
    if (!settings.customGifDataUrl) return;
    imgElement.src = settings.customGifDataUrl;
    setPosition('bottom-right');
    container.style.opacity = '1';
  }

  // ─── Typing Speed Detection ───

  function onKeydown() {
    lastActivityTime = Date.now();
    if (isCustomMode) return;
    keypressTimestamps.push(Date.now());
  }

  function onMouseMove() {
    lastActivityTime = Date.now();
  }

  /** Calculate WPM from keypresses in the rolling window. */
  function calculateWPM() {
    const now = Date.now();
    keypressTimestamps = keypressTimestamps.filter(
      (t) => now - t <= ROLLING_WINDOW_MS
    );

    if (keypressTimestamps.length < 2) return 0;

    const elapsed = (now - keypressTimestamps[0]) / 1000;
    if (elapsed === 0) return 0;

    const chars = keypressTimestamps.length;
    const words = chars / CHARS_PER_WORD;
    const minutes = elapsed / 60;

    return words / minutes;
  }

  /** Periodic WPM check. */
  function startWPMTracking() {
    wpmCalcTimer = setInterval(() => {
      if (isFirstGifPlaying || isCustomMode) return;
      const wpm = calculateWPM();
      if (wpm > WPM_THRESHOLD) {
        flashHighSpeedGif();
      }
    }, WPM_CALC_INTERVAL_MS);
  }

  // ─── Inactivity Detection ───

  function startInactivityTracking() {
    inactivityTimer = setInterval(() => {
      if (isFirstGifPlaying || isCustomMode) return;

      const idleDuration = Date.now() - lastActivityTime;
      if (idleDuration >= INACTIVITY_TIMEOUT_MS) {
        flashHighSpeedGif();
        // Note: lastActivityTime is NOT reset here — it's reset inside
        // flashHighSpeedGif's timeout callback AFTER the animation ends.
        // This prevents the timer from drifting and ensures consistent 10s cycles.
      }
    }, INACTIVITY_CHECK_MS);
  }

  // ─── Event Listeners ───

  function attachListeners() {
    document.addEventListener('keydown', onKeydown, { passive: true });
    document.addEventListener('mousemove', onMouseMove, { passive: true });
  }

  function detachListeners() {
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('mousemove', onMouseMove);
  }

  // ─── Message Listener ───
  // Respond immediately when the popup sends a message (instant feedback).
  function setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'playHello':
          // User switched to a built-in category — play hello animation NOW
          settings.category = message.category;
          isCustomMode = false;
          clearAllTimers();
          playFirstGifSequence();
          startWPMTracking();
          startInactivityTracking();
          applySize();
          sendResponse({ ok: true });
          break;

        case 'showCustom':
          // User uploaded/switched to custom GIF
          settings.category = 'custom';
          settings.customGifDataUrl = message.customGifDataUrl;
          isCustomMode = true;
          clearAllTimers();
          showCustomGif();
          applySize();
          sendResponse({ ok: true });
          break;

        case 'resizeGif':
          // User changed the size slider
          settings.gifSize = message.gifSize || DEFAULT_SIZE;
          applySize();
          sendResponse({ ok: true });
          break;
      }
      return true; // Keep the message channel open for async response
    });
  }

  // ─── Storage Change Listener ───
  // Backup: also respond to storage changes (for tabs that weren't messaged directly).
  function onStorageChange(changes) {
    let needsRestart = false;

    if (changes.category) {
      settings.category = changes.category.newValue;
      needsRestart = true;
    }
    if (changes.gifSize) {
      settings.gifSize = changes.gifSize.newValue || DEFAULT_SIZE;
      applySize();
    }
    if (changes.customGifDataUrl) {
      settings.customGifDataUrl = changes.customGifDataUrl.newValue;
      if (settings.category === 'custom') needsRestart = true;
    }

    if (needsRestart) {
      restartWithCurrentSettings();
    }
  }

  // ─── Timer Management ───

  function clearAllTimers() {
    clearInterval(wpmCalcTimer);
    clearInterval(inactivityTimer);
    clearTimeout(highSpeedTimeout);
    clearTimeout(firstGifTimeout);
    isShowingHighSpeed = false;
    isFirstGifPlaying = false;
    keypressTimestamps = [];
    lastActivityTime = Date.now();
  }

  // ─── (Re)start ───

  function restartWithCurrentSettings() {
    clearAllTimers();

    isCustomMode = settings.category === 'custom';

    if (isCustomMode) {
      showCustomGif();
    } else {
      playFirstGifSequence();
      startWPMTracking();
      startInactivityTracking();
    }

    applySize();
  }

  // ─── Cleanup on unload ───
  function cleanup() {
    detachListeners();
    clearAllTimers();
    chrome.storage.onChanged.removeListener(onStorageChange);
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }

  // ─── Bootstrap ───
  function bootstrap() {
    chrome.storage.local.get(['category', 'gifSize', 'customGifDataUrl'], (data) => {
      settings.category = data.category || 'lizard';
      settings.gifSize = data.gifSize || DEFAULT_SIZE;
      settings.customGifDataUrl = data.customGifDataUrl || null;

      createOverlay();
      attachListeners();
      setupMessageListener();
      chrome.storage.onChanged.addListener(onStorageChange);

      restartWithCurrentSettings();
    });
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

  // Start!
  bootstrap();
})();
