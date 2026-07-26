# RestaurantOS — Client (Frontend)

The React frontend for RestaurantOS. A role-aware single-page app covering every
module — Dashboard, Tables, Orders, Menu, Inventory, Purchase Orders, Suppliers,
Expenses, AI Invoice Processing, and AI Insights — with animated, interactive UI.

---

## 1. Tech Stack

| Purpose | Library |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Routing | react-router-dom v6 |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | lucide-react |
| HTTP client | axios |
| Notifications | react-hot-toast |

No state management library (Redux/Zustand) is used — state is kept local to each
page with `useState`/`useEffect`, plus one small global `AuthContext` for the
logged-in user. This is a deliberate choice: the app's data doesn't need to be
shared across many distant components, so a global store would add complexity
without a real benefit here.

---

## 2. Folder Structure

```
client/
├── index.html                  # Vite entry HTML
├── vite.config.js              # dev server + /api proxy to backend on :5000
├── tailwind.config.js          # custom "brand" color scale, shadows, keyframes
├── postcss.config.js
├── Dockerfile                  # multi-stage build → static file server
└── src/
    ├── main.jsx                 # React root, wraps app in Router + AuthProvider + Toaster
    ├── App.jsx                  # all route definitions, animated route transitions
    ├── index.css                 # global styles: gradients, glass cards, buttons, inputs
    ├── api/
    │   └── client.js             # axios instance; auto-attaches JWT, redirects to /login on 401
    ├── context/
    │   └── AuthContext.jsx       # login/logout, current user, hasRole() helper
    ├── components/
    │   ├── Sidebar.jsx            # role-aware nav with animated active indicator
    │   ├── ProtectedRoute.jsx     # redirects to /login if not authenticated; blocks by role
    │   ├── PageTransition.jsx    # fade/slide wrapper used on every routed page
    │   ├── GenericCrud.jsx        # reusable list+create+delete table (see below)
    │   └── CountUp.jsx            # animated number counter used on Dashboard KPI cards
    └── pages/
        ├── Login.jsx
        ├── Dashboard.jsx
        ├── Tables.jsx
        ├── Orders.jsx
        ├── Menu.jsx
        ├── Inventory.jsx
        ├── PurchaseOrders.jsx
        ├── Suppliers.jsx
        ├── Expenses.jsx
        ├── Invoices.jsx           # AI invoice upload/process/review/export
        └── AiInsights.jsx         # shortage predictions, reorder recs, pricing, waste
```

---

## 3. Getting Started

```bash
cd client
npm install
npm run dev
```

This starts the Vite dev server at **http://localhost:5173**. It expects the
backend API to be running at `http://localhost:5000` (see `server/README.md`) —
`vite.config.js` proxies any request to `/api/*` straight through to it, so the
frontend code just calls relative paths like `api.get('/orders')` and never needs
to know the backend's actual host during development.

```bash
npm run build     # production build → dist/
npm run preview   # serve the production build locally to sanity-check it
```

There is no `.env` file for the client — it doesn't need one. All backend
configuration (database, JWT secret, AI provider keys) lives in `server/.env`
instead.

---

## 4. How Authentication Works

1. `Login.jsx` calls `POST /api/auth/login` with email + password.
2. On success, the JWT and user object are stored in `localStorage` (`ros_token`,
   `ros_user`) and also placed into `AuthContext`.
3. `api/client.js`'s axios interceptor attaches `Authorization: Bearer <token>` to
   every subsequent request automatically — pages never handle this manually.
4. If any request comes back `401` (expired/invalid token), the interceptor clears
   storage and hard-redirects to `/login`.
5. `ProtectedRoute.jsx` wraps every page in `App.jsx` and redirects unauthenticated
   users to `/login`; if a page specifies `roles={[...]}` and the current user's
   role isn't in that list (and isn't `owner`), it shows a "You don't have
   permission" message instead of the page.

`AuthContext.hasRole('manager', 'chef')` returns `true` if the current user's role
is in the list — or if their role is `owner`, since Owner bypasses every
role check in this app, matching the backend's RBAC behavior.

---

## 5. The `GenericCrud` Component

Most master-data pages (Suppliers, Expense Categories, Product Categories,
Ingredients, Stock Movements, etc.) are powered by one shared component instead
of a bespoke page each:

```jsx
<GenericCrud
  title="Suppliers"
  endpoint="suppliers"           // hits /api/suppliers
  icon={Users2}
  fields={[
    { key: 'name', label: 'Name' },
    { key: 'contact_person', label: 'Contact Person' },
  ]}
/>
```

Each field can be:
- **plain text/number/date input** — the default
- **`type: 'select'` with `optionsEndpoint`** — fetches live options from another
  API endpoint (e.g. a Menu Item's Category dropdown pulls from `/menu-categories`)
  and submits the selected option's `id`
- **`type: 'select'` with a static `options` array** — for fixed choices like
  order status or payment method
- **`displayKey`** — when the field is a foreign key, this tells the table to show
  the human-readable joined name (e.g. `cat_name`) instead of the raw id number,
  matching the `joins` config on the corresponding backend route

`GenericCrud` handles searching, loading skeletons, animated row add/remove, toast
feedback on every action, and delete confirmation — all pages using it get this
for free just by describing their fields.

Pages with real workflow logic (Orders, Purchase Orders, Invoices, Dashboard, AI
Insights) are hand-built instead, since they need custom behavior `GenericCrud`
isn't meant to handle (multi-step forms, file uploads, status transitions, charts).

---

## 6. Design System

- **Color**: a custom `brand` orange scale (50–900) defined in `tailwind.config.js`,
  used for buttons, active nav state, badges, and chart accents.
- **Motion**: Framer Motion powers page transitions (`PageTransition.jsx`), the
  sliding active-tab indicator in the sidebar (`layoutId="sidebar-active"`),
  staggered entrance animations on the Dashboard, animated counters (`CountUp`),
  and spring-animated modals (the invoice review dialog).
- **Feedback**: every create/update/delete/AI-processing action shows a
  `react-hot-toast` notification — loading → success/error — instead of failing
  silently or using a blocking `alert()`.
- **Reusable utility classes** (see `index.css`): `.card`, `.btn-primary`,
  `.btn-secondary`, `.input`, `.select`, `.badge`, `.data-table` — built with
  Tailwind's `@apply`, so new pages stay visually consistent without repeating
  long class lists.

---

## 7. Adding a New Page

1. Create `src/pages/YourPage.jsx`.
2. If it's simple master data, use `GenericCrud` (see section 5) — usually under
   20 lines. If it needs custom logic, write it like `Orders.jsx` or
   `PurchaseOrders.jsx`.
3. Register the route in `App.jsx` inside the `<Private>` wrapper, optionally with
   `roles={[...]}` to restrict it.
4. Add a link in `src/components/Sidebar.jsx`'s `links` array, with the same
   `roles` restriction so it's hidden from people who can't access it.
5. Make sure the corresponding backend route exists and enforces the same (or
   stricter) role checks — the frontend hiding a button is a UX nicety, not a
   security boundary; see `server/README.md`.

---

## 8. Building for Production

```bash
npm run build
```

Outputs static files to `client/dist/`. These can be served by any static file
host (`serve`, nginx, a CDN, etc.) — see the root `docker-compose.yml` for a
containerized example. Remember: the built app calls relative `/api/...` paths,
so whatever serves it in production needs to reverse-proxy `/api` to the backend
(the Vite dev-server proxy only applies to `npm run dev`, not the production
build) — see the note in the main project `README.md` under Docker Compose.
