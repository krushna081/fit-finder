# FitFindr (browser-only demo)

Live demo: https://krushna081.github.io/fit-finder/

FitFindr is a static HTML/CSS/JavaScript portfolio prototype for a fictional gym and
fitness-class directory. It is not a production account or payment system.

## What works

- Static pages for classes, trainers, schedules, locations, membership examples, and contact
  links.
- A browser-only demo account flow using `localStorage`.
- A seeded demo account: `john@demo.com` / `john123`.

## Important limitations

- **No real authentication.** `isLoggedIn` is a browser flag and can be changed by the user.
- **No cross-device accounts.** Demo accounts exist only in the browser that created them.
- **No payments.** The payment page is intentionally disabled. Do not enter card or bank
  details anywhere on this site.
- **No email delivery or contact-form backend.** Use the email/phone links on the contact page.
- The demo accounts and data are local to the browser. Clearing site data removes them.
- Demo passwords are stored as client-side hashes. Do not reuse a real password.

## Local preview

This repository has no build step or package manager. Serve the directory with any static file
server, for example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Deployment

The site is published from the `main` branch through GitHub Pages. Push changes to `main`; the
Pages build runs automatically. There is no custom-domain configuration in the repository.

## Security

This is a demo. For a real application, replace the browser-only account flow with a
server-enforced authentication service, move any user data to a server with authorization
rules, use a hosted payment provider, and add a Content Security Policy.
