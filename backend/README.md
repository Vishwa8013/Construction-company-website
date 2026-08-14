# BL Construction Backend

This backend gives the project a real upload API so new media can be managed without rebuilding the frontend every time.

## What it does

- `GET /api/health` - quick health check
- `GET /api/projects` - list all uploaded projects
- `POST /api/projects` - upload a new image, video, or PDF
- `DELETE /api/projects/:id` - remove a project entry and its file

## Local setup

1. Install dependencies:

   ```powershell
   npm install
   npm --prefix backend install
   ```

2. Copy the env file:

   ```powershell
   Copy-Item backend\\.env.example backend\\.env
   ```

3. Start the backend:

   ```powershell
   npm run backend:dev
   ```

4. Start the frontend in another terminal:

   ```powershell
   npm run dev
   ```

The backend runs on `http://localhost:4000` by default.

## Seed the current frontend gallery

To copy the existing `src/assets/photos` folders into the backend JSON catalog, run:

```powershell
npm run backend:seed
```

This is optional, but it gives us a starting dataset before we build the admin upload screen.

## Deployment direction

Since the frontend is on Netlify, the clean next step is:

- frontend: Netlify
- backend: Render or Railway
- later storage upgrade: Cloudinary or S3

The current backend uses local disk storage so we can build and test everything first.
