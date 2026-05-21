// RATU COFFEE - AUTH SCRIPT (Firebase Integrated)
import { auth, db } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// AKUN MANAJER
const MANAGER_EMAIL = "arifmadurock7@gmail.com";
const MANAGER_PASSWORD = "Madurock230600";

// LOGIN UTAMA
window.doLogin = async function () {
  const input = document.getElementById("email").value.trim();
  const password = document.getElementById("pass").value;
  const errBox = document.getElementById("err");
  const loginBtn = document.getElementById("loginBtn");

  errBox.style.background = "rgba(180, 50, 50, 0.1)";
  errBox.style.borderColor = "rgba(180, 50, 50, 0.3)";
  errBox.style.color = "#e07070";

  if (!input) {
    errBox.innerText = "Silakan masukkan Nama Lengkap atau Email.";
    errBox.style.display = "block";
    return;
  }

  // Tampilkan loading
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memeriksa...';
  loginBtn.disabled = true;

  try {
    let email = input;

    // Jika tidak ada karakter @ maka tidak valid
    if (!input.includes("@")) {
      if (
        input.toLowerCase() === "Jibriliyani Maghribi" ||
        input.toLowerCase() === "manajer ratu coffee"
      ) {
        email = MANAGER_EMAIL;
      } else {
        const q = query(collection(db, "users"), where("name", "==", input));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          email = querySnapshot.docs[0].data().email;
        } else {
          throw new Error(
            "Nama pengguna tidak ditemukan. Pastikan huruf besar/kecil sesuai dengan saat mendaftar.",
          );
        }
      }
    }

    // 1. Cek akun Manajer (hardcoded)
    if (
      email.toLowerCase() === MANAGER_EMAIL.toLowerCase() &&
      password === MANAGER_PASSWORD
    ) {
      localStorage.setItem("user_name", "Jibriliyani Maghribi");
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_role", "Manajer");
      localStorage.setItem("is_logged_in", "true");
      localStorage.setItem(
        "user_pic",
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
      );
      window.location.href = "dashboard.html";
      return;
    }

    // 2. Login via Firebase Auth untuk pelanggan
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Ambil data profil dari Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    let userData = { name: email.split("@")[0], role: "Pengguna Baru" };
    if (userDoc.exists()) {
      userData = userDoc.data();
    }

    localStorage.setItem("user_name", userData.name || email.split("@")[0]);
    localStorage.setItem("user_email", email);
    localStorage.setItem("user_role", userData.role || "Pengguna Baru");
    localStorage.setItem("user_uid", user.uid);
    localStorage.setItem("is_logged_in", "true");
    localStorage.setItem(
      "promo_active",
      userData.promoActive ? "true" : "false",
    );
    localStorage.setItem(
      "user_discount",
      (userData.discount || "10").replace("%", ""),
    );
    localStorage.setItem(
      "user_pic",
      userData.picture ||
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    );

    errBox.style.display = "none";
    window.location.href = "dashboard.html";
  } catch (error) {
    loginBtn.innerHTML = "Masuk";
    loginBtn.disabled = false;

    let msg = "Email atau password salah. Coba lagi.";
    if (error.code === "auth/user-not-found")
      msg = "Akun tidak ditemukan. Silakan daftar terlebih dahulu.";
    else if (error.code === "auth/wrong-password")
      msg = "Password salah. Silakan coba lagi.";
    else if (error.code === "auth/too-many-requests")
      msg = "Terlalu banyak percobaan. Coba lagi nanti.";
    else if (error.code === "auth/network-request-failed")
      msg = "Gagal terhubung. Periksa koneksi internet Anda.";

    errBox.innerText = msg;
    errBox.style.display = "block";
    document.getElementById("pass").value = "";
  }
};

// -------------------------------------------------------
// DAFTAR AKUN BARU
// -------------------------------------------------------
window.handleRegister = async function () {
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-pass").value;
  const errBox = document.getElementById("err-register");

  if (!name || !email || !password || !validateEmail(email)) {
    errBox.innerText = !validateEmail(email)
      ? "Format email tidak valid!"
      : "Silakan isi semua data.";
    errBox.style.background = "rgba(180, 50, 50, 0.1)";
    errBox.style.borderColor = "rgba(180, 50, 50, 0.3)";
    errBox.style.color = "#e07070";
    errBox.style.display = "block";
    return;
  }

  if (password.length < 6) {
    errBox.innerText = "Password minimal 6 karakter.";
    errBox.style.background = "rgba(180, 50, 50, 0.1)";
    errBox.style.borderColor = "rgba(180, 50, 50, 0.3)";
    errBox.style.color = "#e07070";
    errBox.style.display = "block";
    return;
  }

  errBox.innerText = "Mendaftarkan akun...";
  errBox.style.background = "rgba(201, 151, 58, 0.1)";
  errBox.style.borderColor = "rgba(201, 151, 58, 0.3)";
  errBox.style.color = "#c9973a";
  errBox.style.display = "block";

  try {
    // Buat akun di Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    const discount = Math.floor(Math.random() * 41) + 10 + "%";

    // Simpan profil ke Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      role: "Pengguna Baru",
      promoActive: false,
      discount: discount,
      createdAt: new Date().toISOString(),
    });

    // Update hitungan anggota di Firestore
    const statsRef = doc(db, "stats", "members");
    await setDoc(
      statsRef,
      {
        count: increment(1),
        emails: arrayUnion(email),
      },
      { merge: true },
    );

    errBox.innerText = "✓ Akun berhasil dibuat! Silakan login.";
    errBox.style.background = "rgba(40, 167, 69, 0.1)";
    errBox.style.borderColor = "rgba(40, 167, 69, 0.3)";
    errBox.style.color = "#4ade80";

    setTimeout(() => switchForm("login"), 2000);
  } catch (error) {
    console.error("Registration error:", error);
    let msg = "Gagal membuat akun. Silakan coba lagi.";
    if (error.code === "auth/email-already-in-use")
      msg = "Email ini sudah terdaftar. Silakan login.";
    else if (error.code === "auth/weak-password")
      msg = "Password terlalu lemah. Gunakan minimal 6 karakter.";
    else if (error.code === "auth/network-request-failed")
      msg = "Gagal terhubung. Periksa koneksi internet Anda.";
    else if (error.code === "permission-denied")
      msg = "Akses ditolak (Database belum disetting ke Test Mode).";
    else msg = `Error: ${error.message}`;

    errBox.innerText = msg;
    errBox.style.background = "rgba(180, 50, 50, 0.1)";
    errBox.style.borderColor = "rgba(180, 50, 50, 0.3)";
    errBox.style.color = "#e07070";
  }
};

// -------------------------------------------------------
// RESET PASSWORD (via Firebase)
// -------------------------------------------------------
window.handleReset = async function () {
  const email = document.getElementById("forgot-email").value.trim();
  const errBox = document.getElementById("err-forgot");

  if (!email || !validateEmail(email)) {
    errBox.innerText = "Silakan masukkan format email yang valid.";
    errBox.style.background = "rgba(180, 50, 50, 0.1)";
    errBox.style.borderColor = "rgba(180, 50, 50, 0.3)";
    errBox.style.color = "#e07070";
    errBox.style.display = "block";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    errBox.innerText = `✓ Link reset password dikirim ke ${email}. Cek email Anda!`;
    errBox.style.background = "rgba(40, 167, 69, 0.1)";
    errBox.style.borderColor = "rgba(40, 167, 69, 0.3)";
    errBox.style.color = "#4ade80";
    errBox.style.display = "block";
  } catch (error) {
    errBox.innerText = "Email tidak ditemukan atau terjadi kesalahan.";
    errBox.style.background = "rgba(180, 50, 50, 0.1)";
    errBox.style.borderColor = "rgba(180, 50, 50, 0.3)";
    errBox.style.color = "#e07070";
    errBox.style.display = "block";
  }
};

// -------------------------------------------------------
// LOGIN SEBAGAI TAMU
// -------------------------------------------------------
window.guestLogin = function () {
  const btn = document.getElementById("guestBtn");
  if (btn) {
    btn.innerHTML =
      '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i> Menyiapkan Sesi...';
    btn.style.opacity = "0.8";
    btn.style.pointerEvents = "none";
  }

  setTimeout(() => {
    // 1. Prioritize existing UID if it's already a guest
    let existingUid = localStorage.getItem("user_uid");
    let existingId = localStorage.getItem("user_email") ? localStorage.getItem("user_email").match(/\d+/) : null;
    
    // 2. Check for persistent storage
    let guestUid = localStorage.getItem("persistent_guest_uid") || (existingUid && existingUid.startsWith("guest_") ? existingUid : null);
    let guestId = localStorage.getItem("persistent_guest_id") || (existingId ? existingId[0] : null);
    
    if (!guestUid) {
        guestId = Math.floor(Math.random() * 10000);
        guestUid = "guest_" + Date.now() + "_" + guestId;
    }

    // Ensure it's saved permanently
    localStorage.setItem("persistent_guest_uid", guestUid);
    localStorage.setItem("persistent_guest_id", guestId);

    localStorage.setItem("user_name", "Pelanggan Tamu");
    localStorage.setItem("user_email", `guest${guestId}@ratucoffee.com`);
    localStorage.setItem("user_role", "Tamu");
    localStorage.setItem("user_uid", guestUid);
    localStorage.setItem("is_logged_in", "true");
    localStorage.setItem(
      "user_pic",
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop",
    );
    window.location.href = "dashboard.html";
  }, 1500);
};

// -------------------------------------------------------
// GOOGLE AUTH INTEGRATION
// -------------------------------------------------------
const GOOGLE_CLIENT_ID =
  "999365143429-1kqhn6tjub3o4kmjqisgfilep5nmeetr.apps.googleusercontent.com";

window.initGoogle = function () {
  if (typeof google === "undefined") {
    setTimeout(window.initGoogle, 100);
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse,
  });

  const container = document.getElementById("googleBtnContainer");
  const availableWidth = container ? container.offsetWidth : 320;
  const buttonWidth = Math.max(200, Math.min(availableWidth - 20, 320));

  google.accounts.id.renderButton(document.getElementById("googleBtn"), {
    theme: "outline",
    size: "large",
    width: buttonWidth,
    text: "signin_with",
    shape: "pill",
  });
};

async function handleCredentialResponse(response) {
  const responsePayload = decodeJwt(response.credential);
  const email = responsePayload.email;
  const name = responsePayload.name;
  const picture = responsePayload.picture;

  const role =
    email.toLowerCase() === MANAGER_EMAIL.toLowerCase()
      ? "Manajer"
      : "Pengguna Baru";

  localStorage.setItem(
    "user_name",
    role === "Manajer" ? "Jibriliyani Maghribi" : name,
  );
  localStorage.setItem("user_email", email);
  localStorage.setItem("user_pic", picture);
  localStorage.setItem("user_role", role);
  localStorage.setItem("is_logged_in", "true");

  // Simpan ke Firestore jika bukan manajer
  if (role !== "Manajer") {
    try {
      // Google login tidak buat Firebase Auth user secara default via GSI
      // Simpan data Google user ke Firestore berdasarkan email
      const statsRef = doc(db, "stats", "members");
      await setDoc(
        statsRef,
        {
          count: increment(1),
          emails: arrayUnion(email),
        },
        { merge: true },
      );
    } catch (e) {
      console.warn("Firestore sync error:", e);
    }
  }

  window.location.href = "dashboard.html";
}

function decodeJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );
  return JSON.parse(jsonPayload);
}

// -------------------------------------------------------
// UTILITIES
// -------------------------------------------------------
window.switchForm = function (form) {
  const forms = ["login", "forgot", "register"];
  forms.forEach((f) => {
    const el = document.getElementById(`${f}-form`);
    el.classList.remove("active");
    el.style.display = "none";
  });
  const activeEl = document.getElementById(`${form}-form`);
  if (activeEl) {
    activeEl.style.display = "flex";
    activeEl.classList.add("active");
  }
  document.querySelectorAll(".error").forEach((err) => {
    err.style.display = "none";
  });
};

window.togglePassword = function () {
  const passInput = document.getElementById("pass");
  const toggleIcon = document.getElementById("toggleIcon");
  if (passInput.type === "password") {
    passInput.type = "text";
    toggleIcon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    passInput.type = "password";
    toggleIcon.classList.replace("fa-eye-slash", "fa-eye");
  }
};

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

window.checkEmail = function (inputId, errId) {
  const email = document.getElementById(inputId).value;
  const errBox = document.getElementById(errId);
  if (email && !validateEmail(email)) {
    errBox.style.display = "block";
  } else {
    errBox.style.display = "none";
  }
};

window.toggleRightPanel = function () {
  const panel = document.getElementById("rightPanel");
  const openBtn = document.getElementById("openPanelBtn");
  const leftPanel = document.querySelector(".left");

  if (panel.classList.contains("panel-off")) {
    panel.classList.remove("panel-off");
    openBtn.classList.remove("show");
    if (leftPanel) leftPanel.classList.add("shrink");
  } else {
    panel.classList.add("panel-off");
    openBtn.classList.add("show");
    if (leftPanel) leftPanel.classList.remove("shrink");
  }
};

window.socialLogin = function (provider) {
  const modal = document.getElementById("socialModal");
  const title = document.getElementById("social-modal-title");
  const brandIcon = document.getElementById("social-brand-icon");
  const content = document.getElementById("socialContent");
  const loading = document.getElementById("socialLoading");

  content.style.display = "block";
  loading.style.display = "none";

  if (provider === "Google") {
    brandIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.86-2.59 3.29-4.53 6.16-4.53z"/>
    </svg>`;
    title.innerText = "Pilih akun Google";
  } else {
    brandIcon.innerHTML =
      '<i class="fab fa-apple" style="color:#000; font-size:28px"></i>';
    title.innerText = "Masuk dengan Apple ID";
  }

  modal.style.display = "flex";
};

window.closeSocialModal = function () {
  document.getElementById("socialModal").style.display = "none";
};

window.selectAccount = function (name, email) {
  const role = email === MANAGER_EMAIL ? "Manajer" : "Pengguna Baru";
  localStorage.setItem("user_name", name);
  localStorage.setItem("user_email", email);
  localStorage.setItem("user_role", role);
  window.location.href = "dashboard.html";
};

// -------------------------------------------------------
// LOAD HANDLER
// -------------------------------------------------------
window.addEventListener("load", () => {
  document.getElementById("email").value = "";
  document.getElementById("pass").value = "";
  window.initGoogle();

  document.getElementById("pass").addEventListener("keydown", function (e) {
    if (e.key === "Enter") window.doLogin();
  });
  document.getElementById("email").addEventListener("keydown", function (e) {
    if (e.key === "Enter") window.doLogin();
  });

  setTimeout(() => {
    document.body.classList.add("ready");
  }, 100);
});
