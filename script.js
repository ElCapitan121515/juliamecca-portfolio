// Universal modal for images and videos
document.querySelectorAll(".project-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const projectCard = link.closest(".project-card");

    // Check if it's an image or video project
    const videoElement = projectCard.querySelector("video");
    const imgElement = projectCard.querySelector("img");

    // Get project details
    const title = projectCard.querySelector("h3").textContent;
    const description = projectCard.querySelector("p").textContent;
    const tags = Array.from(projectCard.querySelectorAll(".tag")).map((tag) => tag.textContent);

    if (videoElement) {
      // It's a video project
      const videoSrc = videoElement.getAttribute("src");
      openGoogleDriveModal("video", videoSrc, title, description, tags);
    } else if (imgElement) {
      // It's an image project
      const imgSrc = imgElement.getAttribute("src");
      openGoogleDriveModal("image", imgSrc, title, description, tags);
    }
  });
});

let currentImageScale = 1;
let isDragging = false;
let startX,
  startY,
  translateX = 0,
  translateY = 0;

// Function to open Google Drive style modal
function openGoogleDriveModal(type, src, title, description, tags) {
  const modal = document.getElementById("projectModal");
  const modalImage = document.getElementById("modalImage");
  const modalVideo = document.getElementById("modalVideo");
  const imageViewer = document.getElementById("imageViewer");
  const videoViewer = document.getElementById("videoViewer");
  const modalTitle = document.getElementById("modalProjectTitle");
  const modalDescription = document.getElementById("modalProjectDescription");
  const modalTags = document.getElementById("modalProjectTags");

  // Reset transformations
  currentImageScale = 1;
  translateX = 0;
  translateY = 0;

  // Set title
  modalTitle.textContent = title;

  // Set description and tags
  modalDescription.textContent = description;
  modalTags.innerHTML = "";
  tags.forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.className = "tag";
    tagElement.textContent = tag;
    modalTags.appendChild(tagElement);
  });

  // Show appropriate content
  if (type === "image") {
    modalImage.src = src;
    modalImage.style.transform = `scale(${currentImageScale}) translate(${translateX}px, ${translateY}px)`;
    imageViewer.style.display = "block";
    videoViewer.style.display = "none";

    // Reset video
    modalVideo.pause();
    modalVideo.currentTime = 0;
    modalVideo.src = "";

    // Show zoom controls for images
    document.getElementById("zoomControls").style.display = "flex";
  } else if (type === "video") {
    modalVideo.src = src;
    modalVideo.load();
    videoViewer.style.display = "block";
    imageViewer.style.display = "none";

    // Reset image
    modalImage.src = "";

    // Hide zoom controls for videos
    document.getElementById("zoomControls").style.display = "none";
  }

  // Show modal
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Close description panel on mobile by default
  if (window.innerWidth <= 480) {
    document.querySelector(".modal-description-panel").classList.remove("show");
    document.getElementById("descriptionToggle").classList.add("collapsed");
  }
}

// Function to close modal
function closeProjectModal() {
  const modal = document.getElementById("projectModal");
  const modalVideo = document.getElementById("modalVideo");

  // Pause video if playing
  modalVideo.pause();
  modalVideo.currentTime = 0;
  modalVideo.src = "";

  // Hide modal
  modal.style.display = "none";
  document.body.style.overflow = "";
}

// Initialize event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");
  const navLinksContainer = document.querySelector(".nav-links");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      const targetSection = document.querySelector(this.getAttribute("href"));

      if (!targetSection) return;

      event.preventDefault();
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      navLinksContainer?.classList.remove("active");
    });
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries.filter((entry) => entry.isIntersecting).sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (!visibleSection) return;

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visibleSection.target.id}`);
      });
    },
    { rootMargin: "-80px 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
  );

  sections.forEach((section) => sectionObserver.observe(section));

  // Close modal when clicking close button
  const closeBtn = document.querySelector(".modal-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeProjectModal);
  }

  // Close modal when clicking outside content (on dark background)
  const modal = document.getElementById("projectModal");
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target.id === "projectModal") {
        closeProjectModal();
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeProjectModal();
    }
  });

  // Toggle description panel
  const descriptionToggle = document.getElementById("descriptionToggle");
  if (descriptionToggle) {
    descriptionToggle.addEventListener("click", function () {
      const panel = document.querySelector(".modal-description-panel");
      panel.classList.toggle("show");
      this.classList.toggle("collapsed");
    });
  }

  // Download functionality
  const downloadBtn = document.querySelector(".modal-download-btn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      const modalImage = document.getElementById("modalImage");
      const modalVideo = document.getElementById("modalVideo");

      if (modalImage && modalImage.src) {
        // Download image
        const link = document.createElement("a");
        link.href = modalImage.src;
        link.download = modalImage.alt || "image";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (modalVideo && modalVideo.src) {
        // Download video
        const link = document.createElement("a");
        link.href = modalVideo.src;
        link.download = "video.mp4";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }

  // Setup zoom controls
  setupImageZoom();
});

// Image zoom and pan functionality
function setupImageZoom() {
  const modalImage = document.getElementById("modalImage");
  const imageViewer = document.getElementById("imageViewer");

  if (!modalImage || !imageViewer) return;

  // Reset on new image load
  modalImage.onload = function () {
    currentImageScale = 1;
    translateX = 0;
    translateY = 0;
    modalImage.style.transform = `scale(${currentImageScale}) translate(${translateX}px, ${translateY}px)`;
    modalImage.style.transition = "transform 0.2s ease";
  };

  // Zoom in
  const zoomInBtn = document.querySelector(".zoom-in-btn");
  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", function () {
      currentImageScale = Math.min(currentImageScale + 0.25, 3);
      modalImage.style.transform = `scale(${currentImageScale}) translate(${translateX}px, ${translateY}px)`;
    });
  }

  // Zoom out
  const zoomOutBtn = document.querySelector(".zoom-out-btn");
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", function () {
      currentImageScale = Math.max(currentImageScale - 0.25, 0.5);
      modalImage.style.transform = `scale(${currentImageScale}) translate(${translateX}px, ${translateY}px)`;
    });
  }

  // Reset zoom
  const zoomResetBtn = document.querySelector(".zoom-reset-btn");
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener("click", function () {
      currentImageScale = 1;
      translateX = 0;
      translateY = 0;
      modalImage.style.transform = `scale(${currentImageScale}) translate(${translateX}px, ${translateY}px)`;
    });
  }

  // Mouse wheel zoom
  imageViewer.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      const rect = imageViewer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.min(Math.max(currentImageScale + delta, 0.5), 3);

      // Adjust translation to zoom toward cursor
      translateX = (translateX - x / currentImageScale) * (newScale / currentImageScale) + x / newScale;
      translateY = (translateY - y / currentImageScale) * (newScale / currentImageScale) + y / newScale;

      currentImageScale = newScale;
      modalImage.style.transform = `scale(${currentImageScale}) translate(${translateX}px, ${translateY}px)`;
    },
    { passive: false },
  );

  // Mouse drag for panning
  imageViewer.addEventListener("mousedown", function (e) {
    if (currentImageScale <= 1) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    modalImage.style.transition = "none";
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;
    e.preventDefault();
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    modalImage.style.transform = `scale(${currentImageScale}) translate(${translateX}px, ${translateY}px)`;
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
    modalImage.style.transition = "transform 0.2s ease";
  });

  // Touch events for mobile
  let touchStartDistance = 0;
  let touchStartScale = 1;

  imageViewer.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        touchStartDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        touchStartScale = currentImageScale;
      } else if (e.touches.length === 1 && currentImageScale > 1) {
        isDragging = true;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
        modalImage.style.transition = "none";
      }
    },
    { passive: false },
  );

  imageViewer.addEventListener(
    "touchmove",
    function (e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const touchDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

        currentImageScale = Math.min(Math.max(touchStartScale * (touchDistance / touchStartDistance), 0.5), 3);
        modalImage.style.transform = `scale(${currentImageScale}) translate(${translateX}px, ${translateY}px)`;
      } else if (e.touches.length === 1 && isDragging) {
        e.preventDefault();
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;
        modalImage.style.transform = `scale(${currentImageScale}) translate(${translateX}px, ${translateY}px)`;
      }
    },
    { passive: false },
  );

  imageViewer.addEventListener("touchend", function () {
    isDragging = false;
    modalImage.style.transition = "transform 0.2s ease";
  });
}

// Make functions globally available
window.openGoogleDriveModal = openGoogleDriveModal;
window.closeProjectModal = closeProjectModal;
