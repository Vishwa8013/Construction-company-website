
# Read File

This is a website for a construction company. You can view it live at this URL:
https://www.blconstructions.in/

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Netlify frontend deployment

This repository is set up so the frontend can be deployed on Netlify and the backend can be hosted separately.

Netlify settings:

- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables:
  - `VITE_BACKEND_URL=https://your-backend-domain.com`
  - `VITE_PUBLIC_SITE_URL=https://blconstructions.in`

The file `netlify.toml` already includes the SPA redirect for client-side routes like `/adminblc` and `/portal`.

## Backend deployment

Host the `backend/` folder on a separate service such as Render or Railway.

Set these environment variables on the backend host:

- `PORT=4000` or the host-provided port
- `CLIENT_ORIGIN=https://your-netlify-site.netlify.app`
- `JWT_SECRET=change-this`
- `DEFAULT_ADMIN_EMAIL=BLConstruction1admin@gmail.com`
- `DEFAULT_ADMIN_PASSWORD=bladminc@123`

After deployment, update Netlify `VITE_BACKEND_URL` to point to the live backend.
