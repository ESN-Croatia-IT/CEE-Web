/**
 * Loads HTML from a file and injects it into the element with the given id.
 * @param {string} id - The id of the element to inject HTML into.
 * @param {string} file - The path to the HTML file to load.
 * @returns {Promise<void>}
 */
async function loadHTML(id, file) {
	try {
	  const response = await fetch(file);
	  if (!response.ok) throw new Error(`Failed to fetch ${file}`);
	  const html = await response.text();
	  document.getElementById(id).innerHTML = html;
	} catch (error) {
	  console.error(error);
	  document.getElementById(id).innerHTML = `<p>Error loading ${file}</p>`;
	}
  }
  
  // Load the header and footer
  window.addEventListener('DOMContentLoaded', () => {
	loadHTML('dropdownlist', '/components/dropdownlist.html');
	loadHTML('footer', '/components/footer.html');
});