// auth-guard.js
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA2v0d2x50ze6we6hiDG999ecj1ZV3o9AI",
    authDomain: "cs-sync-8a6a0.firebaseapp.com",
    projectId: "cs-sync-8a6a0",
    storageBucket: "cs-sync-8a6a0.firebasestorage.app",
    messagingSenderId: "34056179764",
    appId: "1:34056179764:web:f417af5001d576882d360d",
    measurementId: "G-F663CN4012"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Prevent brief flash of protected content before auth resolves
document.documentElement.style.visibility = "hidden";

function clearSessionStorage() {
    [
        "cs_sync_user",
        "cs_sync_email",
        "cs_sync_role",
        "cs_sync_program",
        "cs_sync_batch",
        "cs_sync_dept",
        "cs_sync_avatar"
    ].forEach((key) => localStorage.removeItem(key));
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        clearSessionStorage();
        window.location.replace("index.html");
        return;
    }

    const email = (user.email || "").trim().toLowerCase();
    if (email) {
        localStorage.setItem("cs_sync_email", email);
    }

    // Hydrate localStorage from Firestore if missing or stale
    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
            const data = snap.data() || {};
            const resolvedName = data.fullName || data.name || user.displayName;
            if (resolvedName) localStorage.setItem("cs_sync_user", resolvedName);
            if (data.role) localStorage.setItem("cs_sync_role", data.role);
            if (data.program) localStorage.setItem("cs_sync_program", data.program);
            if (data.batchYear || data.batch) {
                localStorage.setItem("cs_sync_batch", data.batchYear || data.batch);
            }
            if (data.department) localStorage.setItem("cs_sync_dept", data.department);
        }
    } catch (err) {
        console.warn("Auth guard profile sync skipped:", err);
    }

    // Reveal page once verified
    document.documentElement.style.visibility = "visible";

    // Expose resolved user for any page script that wants it
    window.csSyncAuthUser = user;
    window.dispatchEvent(new CustomEvent("cssync:auth-ready", { detail: { user } }));
});

// Ensure any Logout button signs out of Firebase Auth cleanly
document.addEventListener("click", async (e) => {
    const logoutTrigger = e.target.closest("#logoutBtn");
    if (!logoutTrigger) return;
    e.preventDefault();
    try {
        await signOut(auth);
    } catch (err) {
        console.warn("Firebase signOut error:", err);
    }
    clearSessionStorage();
    window.location.replace("index.html");
});

export { app, auth, db };