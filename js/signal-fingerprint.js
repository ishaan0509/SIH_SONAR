/**
 * SONARIS — Signal Fingerprint
 * Deterministic experiment IDs via SHA-256 hash of sorted parameter JSON.
 */

const SignalFingerprint = (() => {
  'use strict';

  async function generate(params) {
    // Sort keys deterministically
    const sorted = sortObject(params);
    const json = JSON.stringify(sorted);

    // SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(json);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Return first 8 chars
    return hashHex.substring(0, 8).toUpperCase();
  }

  function sortObject(obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return obj;
    }
    const sorted = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = sortObject(obj[key]);
    });
    return sorted;
  }

  // Synchronous fallback using simple hash
  function generateSync(params) {
    const json = JSON.stringify(sortObject(params));
    let hash = 0;
    for (let i = 0; i < json.length; i++) {
      const char = json.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit int
    }
    return Math.abs(hash).toString(16).padStart(8, '0').substring(0, 8).toUpperCase();
  }

  return { generate, generateSync };
})();
