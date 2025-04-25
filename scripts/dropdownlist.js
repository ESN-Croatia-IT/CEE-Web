/**
 * Toggles the visibility of the dropdown menu and updates the icon color.
 */
function toggleDropdown() {
    const dropdown = document.getElementById("dropdown");
    const menu = document.getElementById("menu");
    const icon = menu.querySelector("i");
  
    if (dropdown.classList.contains("top-[-100vh]")) {
      dropdown.classList.remove("top-[-100vh]");
      dropdown.classList.add("top-0");
      icon.classList.remove("text-[#2E3192]");
      icon.classList.add("text-white");
    } else {
      dropdown.classList.remove("top-0");
      dropdown.classList.add("top-[-100vh]");
      icon.classList.remove("text-white");
      icon.classList.add("text-[#2E3192]");
    }
  }
