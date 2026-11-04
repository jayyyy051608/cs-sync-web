// Global State Management for CS-Sync
document.addEventListener("DOMContentLoaded", () => {
    // 1. Handle Onboarding Form Submission (index.html)
    const onboardingForm = document.getElementById("onboardingForm");
    if (onboardingForm) {
        onboardingForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const fullName = document.getElementById("fullName").value || "Prince Jay Ceriaca";
            const studentId = document.getElementById("studentId").value || "2026-12345";
            
            // Save to localStorage
            localStorage.setItem("cs_sync_user", fullName);
            localStorage.setItem("cs_sync_id", studentId);
            
            // Redirect to Dashboard
            window.location.href = "dashboard.html";
        });
    }

    // 2. Auto-load User Name across pages
    const userNameDisplay = document.getElementById("userNameDisplay");
    if (userNameDisplay) {
        const savedUser = localStorage.getItem("cs_sync_user");
        if (savedUser) {
            userNameDisplay.textContent = savedUser;
        }
    }

    // 3. Interactive Modal Handling for Faculty Booking (database.html)
    const bookingModal = document.getElementById("bookingModal");
    const openModalBtn = document.getElementById("open-booking-modal");
    const closeModalBtn = document.getElementById("closeModal");
    const cancelBtn = document.getElementById("cancelBtn");
    const bookingForm = document.querySelector(".booking-form");

    if (openModalBtn && bookingModal) {
        openModalBtn.addEventListener("click", () => {
            bookingModal.style.display = "flex";
        });
    }

    if (closeModalBtn && bookingModal) {
        closeModalBtn.addEventListener("click", () => {
            bookingModal.style.display = "none";
        });
    }

    if (cancelBtn && bookingModal) {
        cancelBtn.addEventListener("click", () => {
            bookingModal.style.display = "none";
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("✅ Consultation request successfully submitted to Dr. Felizardo!");
            if (bookingModal) bookingModal.style.display = "none";
        });
    }

    // 4. Interactive Group Overlap Confirmation (overlap.html)
    const confirmMeetingBtn = document.querySelector(".confirm-meeting-btn");
    if (confirmMeetingBtn) {
        confirmMeetingBtn.addEventListener("click", () => {
            alert("🎉 Group meeting successfully scheduled for Friday at 1:00 PM! Added to your calendar.");
            window.location.href = "calendar.html";
        });
    }
});