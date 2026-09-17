# Survello — Requirements Checklist

Everything Survello will do, in the order it gets built. Tick items off as they land.
Each line is **what it does** — then one line on **how it's built**.

You don't need to make any technical decisions here. The "how" is settled in
`00_build_plan.md`. If a "how" line looks wrong to you, say so and I'll change it —
but you never have to choose.

**Scope:** two users (your mum's firm). Not sold or shared beyond them. No regulatory
or compliance work included — that's deliberately out of scope.

---

## Phase 1 — Foundations & hosting

The boring plumbing, done first so that shipping is never scary.

- [ ] **One app, one deploy** — the whole product is a single Go binary with the web UI baked inside it; nothing to wire together.
- [ ] **Runs on one small AWS box** — AWS Lightsail instance, fixed monthly price, no surprise bills.
- [ ] **Deploys itself on push** — GitHub Actions builds the binary and restarts the server when you merge to `main`.
- [ ] **HTTPS that renews itself** — Caddy sits in front and handles certificates automatically, forever.
- [ ] **Database that needs no maintenance** — SQLite file on the box; no database server to run, patch or pay for.
- [ ] **Continuous backups** — Litestream streams every database change to S3 within seconds; restore is one command.
- [ ] **Nightly whole-machine snapshot** — Lightsail automatic snapshots, kept 7 days, as the belt-and-braces layer.
- [ ] **Login** — email + password, argon2id hashing, session cookie. Two accounts, no sign-up page.
- [ ] **Everything scoped to the firm** — an `org` row owns all data; every query is filtered by it, so a future second firm is a config change not a rewrite.
- [ ] **Files live in S3** — photos and documents upload straight from the browser to S3 via presigned URLs, so the little server never handles big files.
- [ ] **Errors reach you** — Sentry free tier catches crashes; a weekly email says "everything is fine" or what broke.
- [ ] **Spend caps** — a monthly AI budget stored in settings; the app refuses to start expensive work once it's hit, and tells you why.

## Phase 2 — Work management

Replacing the spreadsheet. This is the part that gets used every day.

- [ ] **Clients and contacts** — name, company, email, phone, address; a contact belongs to a client.
- [ ] **Contact history** — every email, job and quote for a client shown on one page, newest first.
- [ ] **Leads** — an enquiry before it's real work: who, what, when it came in, how warm.
- [ ] **Quotes** — one or more priced lines against a lead; statuses draft → sent → accepted/declined.
- [ ] **Quote chasing** — anything sent and unanswered past a threshold you set appears on the dashboard with a one-click "draft chaser email".
- [ ] **Accepted quote becomes an instruction** — one button copies the quote lines into live jobs so nothing is retyped.
- [ ] **Instructions (jobs)** — the unit of work: client, property, type, fee, status, assigned surveyor.
- [ ] **Job statuses you can rename** — a simple ordered list of stages in settings; jobs move along it.
- [ ] **Property records** — address, type, and the lease(s) attached to it, reusable across jobs.
- [ ] **Key dates** — lease expiry, break date, date the schedule must be served, deadline for response; each with a reminder lead time.
- [ ] **Key-date alerts** — the daily job puts anything due inside its lead time on the dashboard and in the morning email.
- [ ] **Job notes** — a plain running log per job, timestamped and attributed.
- [ ] **File store per job** — drag-and-drop uploads, previewed inline; PDFs, images, Word, Excel.
- [ ] **Time tracking (timer)** — start/stop button on a job; running timer visible everywhere; survives closing the tab.
- [ ] **Time tracking (manual)** — log a duration after the fact with a description and date.
- [ ] **Billable flag and rates** — each entry is billable or not; each user has an hourly charge-out rate, overridable per job.
- [ ] **Timesheet view** — a week grid per person, editable in place.

## Phase 3 — Money

- [ ] **Invoices** — number, date, client, lines (description, qty, unit price), VAT per line, totals.
- [ ] **Sequential numbering** — a counter in settings with a configurable prefix; never reuses or skips a number.
- [ ] **Invoice from time** — select unbilled time entries on a job, click once, they become invoice lines at each person's rate.
- [ ] **Invoice from fixed fee** — for agreed-fee jobs, bill the fee (or a percentage of it) without touching time.
- [ ] **Staged billing** — invoice a percentage now and the rest later; the job tracks how much of the fee is still unbilled.
- [ ] **Invoice PDF** — rendered from a template to match the firm's existing invoice; a dummy template ships now, swapped for the real one when you send me an example.
- [ ] **Email the invoice** — attaches the PDF to a draft email addressed to the client, ready to review and send.
- [ ] **Payment tracking** — mark paid (full or part) with a date; the balance is what's outstanding.
- [ ] **Aged debtors** — outstanding invoices bucketed 0–30 / 30–60 / 60–90 / 90+ days, on the dashboard.
- [ ] **Invoice chasing** — unpaid past your threshold gets the same one-click "draft chaser" treatment as quotes.
- [ ] **Credit notes** — a negative invoice linked to the original, for when something needs unwinding.
- [ ] **Expenses** — cost, date, category, receipt photo, optionally recharged to a client.
- [ ] **Mileage** — from/to, miles, pence-per-mile rate in settings; totals up per job and per month.
- [ ] **WIP** — unbilled time plus unbilled expenses, per job and total. The number the practice actually lives on.
- [ ] **Fee vs actual** — for each job: fee agreed, hours spent, effective hourly rate. Shows which work is worth taking.
- [ ] **Export for the accountant** — CSV of invoices, payments and expenses for any date range.

## Phase 4 — Site capture

Built as an offline-first web app so it works in basements and plant rooms.

- [ ] **Works with no signal** — the app installs to the iPad home screen and runs fully offline; everything syncs when signal returns.
- [ ] **Offline queue you can see** — a visible "12 items waiting to upload" indicator so nothing is ever silently lost.
- [ ] **Photo capture** — take photos in-app against a job, many in a row, without waiting for uploads.
- [ ] **Photo metadata kept** — timestamp and GPS preserved from capture, so a photo can prove when and where it was taken.
- [ ] **Location tagging** — tag each photo to a building / elevation / floor / room, picked from a list you build as you go.
- [ ] **Voice notes** — hold a button and talk; the recording attaches to the photo or the location.
- [ ] **Voice notes become text** — transcribed automatically on sync, and the text is what feeds the schedule.
- [ ] **Quick typed note** — for when talking isn't practical.
- [ ] **Photo markup** — draw arrows and circles on a photo before it goes in a report.
- [ ] **Photo library per job** — browse by location or by time, with the notes attached.
- [ ] **Storage stays cheap** — images are resized and compressed on upload; originals kept in S3's cheapest tier.

## Phase 5 — Cost library

- [ ] **Rate list** — description, unit (m², item, hour), rate, and which trade it belongs to.
- [ ] **Sources cited** — each rate carries a source name, URL and the date it was checked; shown wherever the rate is used.
- [ ] **Fully editable** — add, edit, archive rates in-app; no waiting on me to change a number.
- [ ] **Starter rate card** — ships with a plausible dummy set so the schedules work from day one; your mum corrects it from experience.
- [ ] **History preserved** — editing a rate creates a new version; an old schedule still shows the figure it was written with.
- [ ] **Uplift factors** — settings for overheads & profit, preliminaries, contingency and fees, applied on top of the raw rates.
- [ ] **Learn from your own jobs** — once there's history, a rate can show what this firm actually charged for the same item before.

## Phase 6 — Schedules

The core product. One engine, three outputs.

- [ ] **Three schedule types** — Dilapidations, Schedule of Condition, Schedule of Works. Same underlying data, different columns and wording.
- [ ] **Generate from a site visit** — the photos, voice notes and locations from Phase 4 become a draft schedule.
- [ ] **Lease-aware (dilaps)** — upload the lease, the relevant covenants are extracted, and each item cites the clause it breaches.
- [ ] **Priced automatically** — each item is matched to the cost library and costed, with the source shown.
- [ ] **Organised by location** — items grouped by building / elevation / room, in a sensible survey order.
- [ ] **Review table** — every field editable in place; reorder, merge, split and delete items; nothing is locked.
- [ ] **Evidence on every line** — click an item to see the photos and the voice note it came from.
- [ ] **AI lines are flagged until checked** — each item shows whether a human has reviewed it, and a schedule warns you if you export with unreviewed lines.
- [ ] **Natural-language editing** — select some rows, type "make these more formal and add a scaffolding allowance", see the proposed changes as a diff, accept or reject.
- [ ] **Undo** — every edit, AI or manual, is reversible.
- [ ] **Export to Excel** — the working format, with formulas intact for totals.
- [ ] **Export to Word** — because the final tidy-up always happens in Word.
- [ ] **Export to PDF** — the client-facing version, from a template matched to the firm's existing schedules (dummy now, real one when you send an example).
- [ ] **Scott Schedule export** — the dilapidations dispute format with claimant/response columns, for when a job goes contested.
- [ ] **Photo appendix** — numbered plates, cross-referenced from the schedule lines.
- [ ] **Issued versions are frozen** — marking a schedule "issued" snapshots it; later edits create a new version and the old one stays readable.

## Phase 7 — Email

- [ ] **Connect the Outlook mailbox** — sign in once with Microsoft; no passwords stored, no IMAP settings to find.
- [ ] **Emails attach to jobs** — incoming mail is matched to a job by sender, subject and property address.
- [ ] **Confirm before it files** — unmatched or uncertain emails wait in a small review list rather than guessing.
- [ ] **Per-job email address** — every job gets a forwarding address, so anything can be filed by bcc'ing it.
- [ ] **Attachments land in the job's files** — automatically, deduplicated.
- [ ] **Only work email is pulled in** — folder and sender rules so personal mail is never ingested.
- [ ] **Send from Survello** — replies go out through the real mailbox and appear in Sent Items, so threads stay intact in Outlook.
- [ ] **Drafted for you** — for each workflow step (quote follow-up, instruction acknowledgement, schedule issued, invoice chase) the app writes a draft in the firm's tone; you always edit and send.
- [ ] **New enquiries become leads** — an email that looks like an enquiry offers a one-click "create lead from this".

## Phase 8 — Dashboard & search

- [ ] **Eight numbers, each with an action** — WIP, aged debtors, pipeline value, quotes awaiting reply, jobs with no activity, key dates due, hours this week, fee-vs-actual outliers. No decorative charts.
- [ ] **Everything is clickable** — each tile opens the list behind it, and each row has the obvious next step on it.
- [ ] **Today list** — what needs doing today, assembled from chasers, key dates and unreviewed items.
- [ ] **Morning email** — the same list in the inbox at 7am, so it works without opening the app.
- [ ] **Search everything** — one box across jobs, clients, notes, emails, documents and schedule items.
- [ ] **Recently viewed** — get back to what you had open yesterday in one click.

---

## Non-functional (true throughout)

- [ ] **Works properly on an iPad** — that's the site device; the layout is designed for it, not squeezed into it.
- [ ] **Fast on a bad connection** — small payloads, optimistic updates, nothing blocks on the network.
- [ ] **No data lock-in** — a single "export everything" button produces a zip of CSVs plus all files.
- [ ] **Import from the spreadsheet** — a one-off importer to bring existing clients and live jobs in on day one.
- [ ] **Never silently deletes** — deletes are soft; there's a bin you can restore from.
- [ ] **Cheap to run** — target under $25/month excluding AI usage, with a hard cap on AI spend.
- [ ] **Style is yours to set** — the current look is kept as a starting point; once it's working you tell me what to change and I change it.
