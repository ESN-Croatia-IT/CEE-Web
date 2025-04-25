# CEE-Web

## CI / CD

This project uses `.github/workflows/deploy.yml` file to deploy directly to the server using Github Actions.

The secrets and variables can be found in the project settings (Settings -> Secrets and variables -> Actions)

All pushes on the `main` branch will trigger a pipeline build for the `cee.esn.hr` subdomain.

Similarly, all pushes on the `dev` branch will trigger a pipeline build for the `dev.cee.esn.hr` subdomain.