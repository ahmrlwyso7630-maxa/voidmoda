# VOIDSTORE (frontend prototype)
Open `index.html` in a browser. Admin: `admin/index.html` (demo login admin@voidstore.demo / demo1234).
- `js/data.js` is the only data source (localStorage key `vs_apps_v1`). Replace its functions with fetch() calls to move to an API.
- Public pages and admin read and write the same data, so publish, edit and delete show up on the site immediately.
- The admin login is a DEMO and NOT secure. Production needs backend auth, roles, a database, upload storage, server-side validation, rate limiting, CSRF protection and backups.
- Download buttons point to placeholder example.com URLs. Replace with official publisher links.
