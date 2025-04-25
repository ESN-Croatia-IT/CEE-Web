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