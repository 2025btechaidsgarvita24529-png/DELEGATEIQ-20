// DelegateIQ — App shell utilities

import { auth, getUserProfile } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Require auth — redirect to login if not signed in
export function requireAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    const profile = await getUserProfile(user.uid);
    callback(user, profile);
  });
}

// Populate sidebar user info
export function populateSidebarUser(user, profile) {
  const nameEl = document.getElementById('sidebarUserName');
  const roleEl = document.getElementById('sidebarUserRole');
  const avatarEls = document.querySelectorAll('.avatar-btn, .sidebar-avatar');

  const displayName = profile?.displayName || user.displayName || user.email?.split('@')[0] || 'Delegate';
  const initials = profile?.initials || displayName.substring(0, 2).toUpperCase();
  const school = profile?.school || 'DelegateIQ Member';

  if (nameEl) nameEl.textContent = displayName;
  if (roleEl) roleEl.textContent = school;
  avatarEls.forEach(el => el.textContent = initials);
}

// Show badge toast notification
export function showBadgeToast(badge) {
  const existing = document.getElementById('badgeToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'badge-toast';
  toast.id = 'badgeToast';
  toast.innerHTML = `
    <div class="toast-emoji">${badge.icon}</div>
    <div class="toast-text">
      <p>🏅 Badge Unlocked!</p>
      <h4>${badge.name}</h4>
      <span>${badge.desc}</span>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// Logout
export function setupLogout() {
  const logoutBtns = document.querySelectorAll('.logout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      await signOut(auth);
      window.location.href = '../index.html';
    });
  });
}

// Sidebar toggle for mobile
export function setupSidebarToggle() {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
}
