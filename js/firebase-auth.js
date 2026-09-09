/**
 * SONARIS — Firebase Authentication & Firestore Operations
 */

const FirebaseAuth = (() => {
  'use strict';

  let app = null;
  let auth = null;
  let db = null;
  let currentUser = null;
  let authCallbacks = [];

  function init() {
    try {
      if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK not loaded. Auth features disabled.');
        return false;
      }

      if (FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
        console.warn('Firebase not configured. Replace values in firebase-config.js');
        return false;
      }

      app = firebase.initializeApp(FIREBASE_CONFIG);
      auth = firebase.auth();
      db = firebase.firestore();

      auth.onAuthStateChanged((user) => {
        currentUser = user;
        authCallbacks.forEach(cb => cb(user));
        updateAuthUI(user);
      });

      return true;
    } catch (e) {
      console.warn('Firebase init failed:', e.message);
      return false;
    }
  }

  function onAuthChange(callback) {
    authCallbacks.push(callback);
    // Immediate callback with current state
    if (currentUser !== undefined) {
      callback(currentUser);
    }
  }

  async function signInWithGoogle() {
    if (!auth) {
      showToast('Firebase not configured. See firebase-config.js', 'warning');
      return null;
    }

    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      showToast(`Welcome, ${result.user.displayName}!`, 'success');
      return result.user;
    } catch (e) {
      console.error('Sign-in error:', e);
      showToast('Sign-in failed: ' + e.message, 'error');
      return null;
    }
  }

  async function signOut() {
    if (!auth) return;
    try {
      await auth.signOut();
      showToast('Signed out', 'info');
    } catch (e) {
      console.error('Sign-out error:', e);
    }
  }

  function getUser() {
    return currentUser;
  }

  function isSignedIn() {
    return !!currentUser;
  }

  /* ============================================================
     FIRESTORE — Experiments CRUD
     ============================================================ */
  async function saveExperiment(data) {
    if (!db || !currentUser) {
      showToast('Sign in to save experiments', 'warning');
      return null;
    }

    try {
      const experiment = {
        ...data,
        uid: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db
        .collection('users')
        .doc(currentUser.uid)
        .collection('experiments')
        .add(experiment);

      showToast('Experiment saved!', 'success');
      return docRef.id;
    } catch (e) {
      console.error('Save error:', e);
      showToast('Failed to save: ' + e.message, 'error');
      return null;
    }
  }

  async function loadExperiments() {
    if (!db || !currentUser) return [];

    try {
      const snapshot = await db
        .collection('users')
        .doc(currentUser.uid)
        .collection('experiments')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (e) {
      console.error('Load error:', e);
      return [];
    }
  }

  async function loadExperiment(id) {
    if (!db || !currentUser) return null;

    try {
      const doc = await db
        .collection('users')
        .doc(currentUser.uid)
        .collection('experiments')
        .doc(id)
        .get();

      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (e) {
      console.error('Load error:', e);
      return null;
    }
  }

  async function deleteExperiment(id) {
    if (!db || !currentUser) return false;

    try {
      await db
        .collection('users')
        .doc(currentUser.uid)
        .collection('experiments')
        .doc(id)
        .delete();

      showToast('Experiment deleted', 'info');
      return true;
    } catch (e) {
      console.error('Delete error:', e);
      showToast('Failed to delete: ' + e.message, 'error');
      return false;
    }
  }

  function exportExperimentJSON(experiment) {
    const blob = new Blob([JSON.stringify(experiment, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonaris_experiment_${experiment.fingerprint || experiment.id || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Experiment exported as JSON', 'success');
  }

  /* ============================================================
     UI HELPERS
     ============================================================ */
  function updateAuthUI(user) {
    const authArea = document.getElementById('auth-area');
    if (!authArea) return;

    if (user) {
      authArea.innerHTML = `
        <div class="sidebar-user">
          <img class="user-avatar" src="${user.photoURL || ''}" alt="${user.displayName || 'User'}"
               onerror="this.style.display='none'">
          <div>
            <div class="user-name">${user.displayName || 'User'}</div>
            <div class="user-email">${user.email || ''}</div>
          </div>
        </div>
        <button class="sonar-btn btn-ghost btn-sm" onclick="FirebaseAuth.signOut()" style="margin-top:8px;width:100%">
          Sign Out
        </button>
      `;
    } else {
      authArea.innerHTML = `
        <button class="sonar-btn btn-secondary btn-sm" onclick="FirebaseAuth.signInWithGoogle()" style="width:100%">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 3h6.93c-.04.34-.11.67-.19 1H13v-1zm0 3h5.92c-.2.35-.43.69-.68 1H13v-1zm0 3h2.87c-.87.48-1.84.8-2.87.93V19z"/>
          </svg>
          Sign In with Google
        </button>
      `;
    }
  }

  return {
    init,
    onAuthChange,
    signInWithGoogle,
    signOut,
    getUser,
    isSignedIn,
    saveExperiment,
    loadExperiments,
    loadExperiment,
    deleteExperiment,
    exportExperimentJSON
  };
})();
