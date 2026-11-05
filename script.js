const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main section[id]")];
const memoryCards = [...document.querySelectorAll(".memory-card")];
const memoryModal = document.querySelector("#memory-modal");
const memoryPhoto = memoryModal.querySelector(".memory-photo");
const memoryVideo = memoryModal.querySelector(".memory-video");
const memoryPhotoCaption = memoryModal.querySelector(".memory-photo-caption");
const memoryTitle = memoryModal.querySelector("#memory-title");
const memoryText = memoryModal.querySelector(".memory-text");
const memorySignoff = memoryModal.querySelector(".memory-signoff");
const memoryClose = memoryModal.querySelector(".memory-close");
const dateModal = document.querySelector("#date-modal");
const dateYesButton = document.querySelector("#date-yes-button");
const dateInviteButton = document.querySelector("#date-invite-button");
const jomModal = document.querySelector("#jom-modal");
const jomClose = jomModal.querySelector(".jom-close");
const pullRefreshIndicator = document.querySelector("#pull-refresh-indicator");
let activeMemoryCard = null;

document.querySelector("#year").textContent = new Date().getFullYear();

let pullStartX = 0;
let pullStartY = 0;
let isTrackingPull = false;
let isPullingToRefresh = false;
let isRefreshing = false;

function resetPullRefresh() {
  pullRefreshIndicator.classList.remove("is-pulling");
  isTrackingPull = false;
  isPullingToRefresh = false;
}

window.addEventListener("touchstart", (event) => {
  if (
    !window.matchMedia("(pointer: coarse)").matches ||
    event.touches.length !== 1 ||
    window.scrollY > 0 ||
    document.body.classList.contains("locked") ||
    nav.classList.contains("is-open") ||
    isRefreshing
  ) return;

  pullStartX = event.touches[0].clientX;
  pullStartY = event.touches[0].clientY;
  isTrackingPull = true;
}, { passive: true });

window.addEventListener("touchmove", (event) => {
  if (!isTrackingPull) return;
  if (event.touches.length !== 1) {
    resetPullRefresh();
    return;
  }

  const deltaX = event.touches[0].clientX - pullStartX;
  const deltaY = event.touches[0].clientY - pullStartY;
  if (deltaY <= 0 || Math.abs(deltaX) > deltaY || window.scrollY > 0) {
    resetPullRefresh();
    return;
  }

  const distance = Math.min(deltaY * 0.55, 96);
  isPullingToRefresh = distance >= 68;
  pullRefreshIndicator.classList.toggle("is-pulling", isPullingToRefresh);
}, { passive: true });

window.addEventListener("touchend", (event) => {
  if (!isTrackingPull) return;
  if (event.touches.length > 0) {
    resetPullRefresh();
    return;
  }
  isTrackingPull = false;

  if (!isPullingToRefresh) {
    resetPullRefresh();
    return;
  }

  isRefreshing = true;
  pullRefreshIndicator.classList.remove("is-pulling");
  pullRefreshIndicator.classList.add("is-refreshing");
  window.setTimeout(() => window.location.reload(), 900);
}, { passive: true });

window.addEventListener("touchcancel", resetPullRefresh, { passive: true });

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Buka menu" : "Tutup menu");
  nav.classList.toggle("is-open", !isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Buka menu");
  });
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13 });
  document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const currentId = entry.target.id;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
      });
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  sections.forEach((section) => sectionObserver.observe(section));
} else {
  document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
}

function closeMemory() {
  memoryVideo.pause();
  memoryVideo.currentTime = 0;
  memoryModal.classList.remove("is-open");
  memoryModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("locked");
  activeMemoryCard?.focus();
}

memoryCards.forEach((card) => {
  card.addEventListener("click", () => {
    activeMemoryCard = card;
    memoryVideo.pause();
    memoryVideo.removeAttribute("src");
    memoryVideo.load();
    if (card.dataset.video) {
      memoryPhoto.hidden = true;
      memoryVideo.hidden = false;
      memoryVideo.src = card.dataset.video;
      memoryPhotoCaption.textContent = "video untuk sayang ♡";
    } else {
      memoryVideo.hidden = true;
      memoryPhoto.hidden = false;
      memoryVideo.currentTime = 0;
      memoryPhoto.src = card.dataset.image;
      memoryPhoto.alt = card.dataset.imageAlt;
      memoryPhotoCaption.textContent = "kenangan untuk sayang ♡";
    }
    memoryTitle.textContent = card.dataset.title;
    memoryText.textContent = card.dataset.message;
    memoryText.hidden = !card.dataset.message;
    memorySignoff.hidden = !card.dataset.message;
    memoryModal.classList.add("is-open");
    memoryModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    memoryClose.focus();
    makeHearts(38);
    if (card.dataset.video) {
      memoryVideo.play().catch(() => {
        memoryPhotoCaption.textContent = "Tekan play untuk mula menonton ♡";
      });
    }
  });
});

memoryVideo.addEventListener("error", () => {
  memoryPhotoCaption.textContent = "Video tak dapat dimainkan. Semak fail vid.mp4.";
});
memoryClose.addEventListener("click", closeMemory);
memoryModal.addEventListener("click", (event) => {
  if (event.target === memoryModal) closeMemory();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (noteImageModal.classList.contains("is-open")) closeNoteImage();
    else if (jomModal.classList.contains("is-open")) closeJomModal();
    else if (dateModal.classList.contains("is-open")) closeDateModal();
    else if (memoryModal.classList.contains("is-open")) closeMemory();
    else if (note.classList.contains("is-open")) closeNote();
  }
});

function closeDateModal() {
  dateModal.classList.remove("is-open");
  dateModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("locked");
  dateInviteButton.focus();
}

function closeJomModal() {
  jomModal.classList.remove("is-open");
  jomModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("locked");
  dateInviteButton.focus();
}

dateInviteButton.addEventListener("click", () => {
  dateModal.classList.add("is-open");
  dateModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  dateYesButton.focus();
});
dateModal.querySelector(".date-close").addEventListener("click", closeDateModal);
dateModal.addEventListener("click", (event) => {
  if (event.target === dateModal) closeDateModal();
});
dateYesButton.addEventListener("click", () => {
  closeDateModal();
  jomModal.classList.add("is-open");
  jomModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  jomClose.focus();
  makeHearts(80);
});
jomClose.addEventListener("click", closeJomModal);
jomModal.addEventListener("click", (event) => {
  if (event.target === jomModal) closeJomModal();
});

const note = document.querySelector("#letter-note");
const noteImageModal = document.querySelector("#note-image-modal");
const noteImage = noteImageModal.querySelector("img");
const noteImageClose = noteImageModal.querySelector(".note-image-close");
let activeNotePhoto = null;
function closeNoteImage() {
  noteImageModal.classList.remove("is-open");
  noteImageModal.setAttribute("aria-hidden", "true");
  activeNotePhoto?.focus();
}

document.querySelectorAll(".note-photo-button").forEach((button) => {
  button.addEventListener("click", () => {
    activeNotePhoto = button;
    noteImage.src = button.dataset.noteImage;
    noteImage.alt = button.dataset.noteAlt;
    noteImageModal.classList.add("is-open");
    noteImageModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    noteImageClose.focus();
  });
});
noteImageClose.addEventListener("click", closeNoteImage);
noteImageModal.addEventListener("click", (event) => {
  if (event.target === noteImageModal) closeNoteImage();
});

function closeNote() {
  note.classList.remove("is-open");
  document.body.classList.remove("locked");
}

document.querySelector("#surprise-button").addEventListener("click", () => {
  note.classList.add("is-open");
  document.body.classList.add("locked");
  note.querySelector(".note-close").focus();
  makeHearts(34);
});
note.querySelector(".note-close").addEventListener("click", closeNote);

function makeHearts(count) {
  const layer = document.querySelector(".confetti-layer");
  const colors = ["#bd8290", "#d8aeb6", "#b8a8c4", "#e7c7b9", "#d6c3d3"];
  for (let index = 0; index < count; index += 1) {
    const heart = document.createElement("span");
    heart.className = "confetti-heart";
    heart.textContent = index % 4 === 0 ? "✧" : "♡";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.color = colors[index % colors.length];
    heart.style.fontSize = `${12 + Math.random() * 18}px`;
    heart.style.setProperty("--duration", `${2.3 + Math.random() * 2.2}s`);
    heart.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
    layer.append(heart);
    heart.addEventListener("animationend", () => heart.remove(), { once: true });
  }
}
