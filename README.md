# BrandHub Portal

A React + Vite portal for searching and browsing content across WordPress, Drupal, product knowledge, and support resources in one place.

## Overview

This project is a front-end content discovery experience built with React. It includes:

- a landing page with a premium hero section
- a searchable results experience
- filter and sorting controls
- detail pages for individual content
- a demo request form
- route-based navigation using React Router

## Tech stack

- React 19
- Vite
- React Router DOM
- Plain CSS for styling

## Run locally

1. Configure the API Gateway base URL in `.env.local` (copy `.env.example` and replace `YOUR_API_ID` with the deployed API ID):
   ```text
   VITE_BRANDHUB_API_URL=https://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/dev
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open the local URL shown in the terminal, typically:
   ```bash
   http://localhost:5173
   ```

The portal loads listing and search results from `GET /content`, filter options from `GET /filters`, and detail pages from `GET /content/{id}`. Listing requests include an empty `_hp` parameter and use API-side search, filtering, sorting, and pagination. If the frontend runs on a different origin, add that exact origin to the Lambda `ALLOWED_ORIGINS` setting and API Gateway CORS configuration.

## Production build

```bash
npm run build
```

## Project structure

```text
src/
  components/
  data/
  pages/
  utils/
  App.jsx
  main.jsx
```

