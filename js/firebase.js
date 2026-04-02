// DelegateIQ — Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCqNmnpQRg5uUYu4Pp_k0k90wNBmJxpuH0",
  authDomain: "delegate-iq-2025.firebaseapp.com",
  projectId: "delegate-iq-2025",
  storageBucket: "delegate-iq-2025.firebasestorage.app",
  messagingSenderId: "612696020579",
  appId: "1:612696020579:web:90255861a0d531f2580a56",
  measurementId: "G-JBH50RVLXB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Badge definitions
export const BADGES = {
  first_login: { id: "first_login", name: "First Step", icon: "🚀", desc: "Joined DelegateIQ", color: "#6366f1" },
  first_conference: { id: "first_conference", name: "Delegate", icon: "🏛️", desc: "Attended your first conference", color: "#8b5cf6" },
  five_conferences: { id: "five_conferences", name: "Seasoned Delegate", icon: "⭐", desc: "Attended 5 conferences", color: "#f59e0b" },
  first_research: { id: "first_research", name: "Researcher", icon: "🔍", desc: "Completed first research session", color: "#10b981" },
  position_paper: { id: "position_paper", name: "Paper Writer", icon: "📄", desc: "Submitted a position paper", color: "#3b82f6" },
  first_award: { id: "first_award", name: "Award Winner", icon: "🏆", desc: "Won your first MUN award", color: "#f59e0b" },
  resolution_drafter: { id: "resolution_drafter", name: "Drafter", icon: "📜", desc: "Drafted a resolution", color: "#ec4899" },
  dirt_finder: { id: "dirt_finder", name: "Strategist", icon: "🕵️", desc: "Used Dirt Finder 3 times", color: "#64748b" },
  committee_join: { id: "committee_join", name: "Committee Member", icon: "👥", desc: "Joined a committee on DelegateIQ", color: "#06b6d4" },
  ten_research: { id: "ten_research", name: "Scholar", icon: "🎓", desc: "Completed 10 research sessions", color: "#8b5cf6" },
};

// Create user profile in Firestore
export async function createUserProfile(uid, data) {
  await setDoc(doc(db, "users", uid), {
    ...data,
    badges: ["first_login"],
    conferences: [],
    researchCount: 0,
    dirtFinderCount: 0,
    createdAt: new Date().toISOString(),
  });
}

// Get user profile
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// Award a badge
export async function awardBadge(uid, badgeId) {
  const profile = await getUserProfile(uid);
  if (profile && !profile.badges.includes(badgeId)) {
    await updateDoc(doc(db, "users", uid), { badges: arrayUnion(badgeId) });
    return true; // new badge!
  }
  return false;
}

// Increment research count and check badge
export async function incrementResearch(uid) {
  const profile = await getUserProfile(uid);
  if (!profile) return;
  const newCount = (profile.researchCount || 0) + 1;
  await updateDoc(doc(db, "users", uid), { researchCount: newCount });
  if (newCount === 1) await awardBadge(uid, "first_research");
  if (newCount === 10) await awardBadge(uid, "ten_research");
}

// Add conference and check badges
export async function addConference(uid, conference) {
  const profile = await getUserProfile(uid);
  if (!profile) return;
  const conferences = [...(profile.conferences || []), conference];
  await updateDoc(doc(db, "users", uid), { conferences });
  if (conferences.length === 1) await awardBadge(uid, "first_conference");
  if (conferences.length === 5) await awardBadge(uid, "five_conferences");
  if (conference.award) await awardBadge(uid, "first_award");
}

export { onAuthStateChanged, signOut, updateProfile };
