/**
 * Handles FAQ expand/collapse animation on DOMContentLoaded.
 */
document.addEventListener("DOMContentLoaded", () => {
    const faqs = document.querySelectorAll("details");
  
    faqs.forEach((el) => {
      const content = el.querySelector(".faq-content");
  
      // Initialize
      if (!el.open) {
        content.style.maxHeight = "0";
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
  
      el.addEventListener("toggle", () => {
        if (el.open) {
          // Opening
          content.style.maxHeight = content.scrollHeight + "px";
  
          // Wait for transition to complete then remove maxHeight
          const onOpenTransitionEnd = () => {
            content.style.maxHeight = "none"; // allow natural height after animation
            content.removeEventListener("transitionend", onOpenTransitionEnd);
          };
          content.addEventListener("transitionend", onOpenTransitionEnd);
        } else {
          // Closing
          // Step 1: Set current height to enable animation from known value
          content.style.maxHeight = content.scrollHeight + "px";
  
          // Step 2: Force reflow
          requestAnimationFrame(() => {
            // Step 3: Collapse to zero
            content.style.maxHeight = "0";
  
            // Cleanup after transition ends
            const onCloseTransitionEnd = () => {
              content.style.maxHeight = "0"; // Ensure it stays collapsed
              content.removeEventListener("transitionend", onCloseTransitionEnd);
            };
            content.addEventListener("transitionend", onCloseTransitionEnd);
          });
        }
      });
    });
  });
