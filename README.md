# CEE-Web

## CI / CD

This project uses `.github/workflows/deploy.yml` file to deploy directly to the server using Github Actions.

The secrets and variables can be found in the project settings (Settings -> Secrets and variables -> Actions)

All pushes on the `main` branch will trigger a pipeline build for the `cee.esn.hr` subdomain.

Similarly, all pushes on the `dev` branch will trigger a pipeline build for the `dev.cee.esn.hr` subdomain.

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
- Install `typescript` globally: `npm install -g typescript`
- Run `tsc --noEmit` to check for JSDoc type errors.