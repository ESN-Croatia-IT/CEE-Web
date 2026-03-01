# CEE-Web

## Project Description

CEE-Web is a web application for managing and presenting information for the Croatian Erasmus Event (CEE) organized by ESN Croatia IT Team. It provides tools for editors, event details, FAQs, highlights, and more, supporting both public and admin/editor views.

## CI / CD

This project uses `.github/workflows/deploy.yml` file to deploy directly to the server using Github Actions.

The secrets and variables can be found in the project settings (Settings -> Secrets and variables -> Actions)

All pushes on the `main` branch will trigger a pipeline build for the `cee.esn.hr` subdomain.

Similarly, all pushes on the `dev` branch will trigger a pipeline build for the `dev.cee.esn.hr` subdomain.

## Setup & Installation

1. Clone the repository:
  ```sh
  git clone https://github.com/ESN-Croatia-IT/CEE-Web.git
  ```
2. Install dependencies:
  ```sh
  npm install
  ```
3. Configure environment variables and secrets as needed for deployment (see CI/CD section).
4. Start the development server:
  ```sh
  npm run dev
  ```

## JSDoc

JSDoc is supported in this project.  
- JavaScript files are checked with TypeScript using `"checkJs": true` in `tsconfig.json`.
- You can add JSDoc comments (`/** ... */`) above functions, classes, and variables for type checking and documentation.
- Example:
  ```js
  /**
   * Adds two numbers.
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */
  function add(a, b) {
    return a + b;
  }
  ```

## Usage Guide

- Access the homepage at `localhost:3000` for public event information.
- Editors can log in and access editor views for content management at `localhost:3000/login` and `localhost:3000/editor`.
- Static assets and styles are managed in `src/static` and `src/input.css`.
- EJS templates for views are in `src/views`.

## Technologies Used

- Node.js
- Express.js
- EJS (Embedded JavaScript templates)
- Tailwind CSS
- TypeScript
- GitHub Actions (CI/CD)

## Contribution Guidelines

1. Fork the repository and create your feature branch (`git checkout -b your-feature`).
2. Commit your changes with clear messages.
3. Push to your branch and open a pull request.
4. Follow code style and documentation standards (see JSDoc section).

## Contact

For questions, suggestions, or support, contact the ESN Croatia IT Team:
- GitHub: [ESN-Croatia-IT](https://github.com/ESN-Croatia-IT)