/**
 * Floating Meme – Background Service Worker
 *
 * Sets default storage values when the extension is first installed.
 */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      category: 'lizard',
      gifSize: 150,
      customGifDataUrl: null
    });
  }
});
