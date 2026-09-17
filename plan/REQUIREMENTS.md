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
- [ ] **Two roles** — **Principal** sees everything; **Surveyor** sees the money the client sees, but not the money that measures people. Jaye is a Surveyor.
- [ ] **A Surveyor sees the commercial picture** — job fees, quotes, invoices and whether they're paid. Knowing what a job is worth is part of learning the trade.
- [ ] **A Surveyor never sees charge-out rates** — not their own, not anyone's. This is the line.
- [ ] **No metric that prices a person** — no effective hourly rate, no fee-versus-actual, no write-offs, no utilisation or billable percentage, no WIP broken down by who earned it. These are the numbers that tell someone what they're worth, and a graduate doesn't need them.
- [ ] **Own timesheet only, in hours** — a Surveyor sees their own time as time. Not converted to money, and not next to anyone else's.
- [ ] **Material and labour rates are not charge-out rates** — the cost library is needed to write a schedule, so everyone sees and edits it normally.
- [ ] **Hidden, not greyed out** — restricted things are absent from the interface rather than visibly locked, so it doesn't feel like working in someone else's account.
- [ ] **Rates enforced on the server** — rate fields are stripped in the API rather than hidden in the browser, so the number never reaches the device.
- [ ] **Files live in S3** — photos and documents upload straight from the browser to S3 via presigned URLs, so the little server never handles big files.
- [ ] **Errors reach you** — Sentry free tier catches crashes; a weekly email says "everything is fine" or what broke.
- [ ] **Spend is visible, not policed** — a monthly AI budget in settings, with spend to date shown as a dashboard tile. Going over warns; it doesn't block.
- [ ] **Never priced at the point of use** — no cost shown on a generation run or anywhere in the working flow. Seeing a price before every action would stop them using the thing they're paying for.
- [ ] **A runaway ceiling, well above the budget** — a much higher hard stop that exists to catch a bug or a loop, not to ration normal work. If it ever fires, something is wrong and you want to know.

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
- [ ] **Site, office or travel** — every entry is tagged with where the time went, so a job shows the split and future fee proposals can be based on real numbers.
- [ ] **Billable flag** — each entry is billable or not, defaulting to billable.
- [ ] **Rate per person** — each user has a default hourly charge-out rate, set once in settings.
- [ ] **Rate override per job** — a job can carry its own rate for one or both people, overriding the default.
- [ ] **Rates never rewrite history** — the rate in force is stamped onto the entry when it's logged, so changing a rate later can't silently re-price old unbilled time.
- [ ] **Timesheet view** — a week grid per person, editable in place, with the site/office/travel split visible.

## Phase 3 — Money

- [ ] **Invoices** — number, date, client, lines (description, qty, unit price), VAT per line, totals.
- [ ] **Sequential numbering** — a counter in settings with a configurable prefix; never reuses or skips a number.
- [ ] **Invoice from time** — select unbilled time entries on a job, click once, they become invoice lines at each person's rate.
- [ ] **Invoice from fixed fee** — for agreed-fee jobs, bill the fee (or a percentage of it) without touching time.
- [ ] **Adjust the final value** — the total from time is only a starting point; set the amount actually billed, with a reason, and the difference is recorded against the job.
- [ ] **Write-offs are visible** — time logged but not billed, per job and per month, so it's a number you can see rather than one that quietly disappears.
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

- [ ] **Works with no signal** — the app installs to the Android tablet's home screen and runs fully offline; everything syncs when signal returns.
- [ ] **Offline queue you can see** — a visible "12 items waiting to upload" indicator so nothing is ever silently lost.
- [ ] **Photo capture** — take photos in-app against a job, many in a row, without waiting for uploads.
- [ ] **Photo metadata kept** — timestamp and GPS preserved from capture, so a photo can prove when and where it was taken.
- [ ] **Location tagging** — tag each photo to a building / elevation / floor / room, picked from a list you build as you go.
- [ ] **Voice notes** — hold a button and talk; the recording attaches to the photo or the location.
- [ ] **Voice notes become text** — transcribed automatically on sync, and the text is what feeds the schedule.
- [ ] **Quick typed note** — for when talking isn't practical.
- [ ] **Time logged on site** — the timer runs offline on the tablet and syncs with everything else, so site hours aren't reconstructed from memory that evening.
- [ ] **Photo markup** — draw arrows and circles on a photo before it goes in a report.
- [ ] **Photo library per job** — browse by location or by time, with the notes attached.
- [ ] **Storage stays cheap** — images are resized and compressed on upload; originals kept in S3's cheapest tier.

## Phase 5 — Cost library

- [ ] **Rates overview** — one browsable, searchable screen of every material and labour rate: description, unit (m², item, hour), rate, trade, source, and when it was last checked.
- [ ] **Sources cited** — each rate carries a source name, URL and the date it was checked; shown wherever the rate is used.
- [ ] **Fully editable** — add, edit, archive rates in-app; no waiting on me to change a number.
- [ ] **Update button** — one click sends a research agent off to re-check every rate against its cited source and the wider web.
- [ ] **Proposed changes, never applied changes** — the agent returns a list of old → new with its evidence and a link; you accept or reject each row, and nothing moves until you do.
- [ ] **Stale rates flagged** — anything not checked for longer than a threshold you set is badged in the overview, so you know what needs attention.
- [ ] **Update runs in the background** — a queued job with its own spend cap; close the tab and come back to the results.
- [ ] **See where a rate is used** — open a rate and see which schedules reference it, so a correction can be traced through.
- [ ] **Starter rate card** — ships with a plausible dummy set so the schedules work from day one; your mum corrects it from experience.
- [ ] **History preserved** — editing a rate creates a new version; an old schedule still shows the figure it was written with.
- [ ] **Uplift factors** — settings for overheads & profit, preliminaries, contingency and fees, applied on top of the raw rates.
- [ ] **Learn from your own jobs** — once there's history, a rate can show what this firm actually charged for the same item before.

## Phase 6 — Schedules

The core product. One engine, three outputs.

- [ ] **Schedule types are configurable** — a type defines its columns, its wording style and its template; new types are added in settings, not in code.
- [ ] **Ships with the common ones** — Dilapidations (interim and terminal), Schedule of Condition, Schedule of Works, Schedule of Defects, Snagging list, Planned maintenance.
- [ ] **Generate from a site visit** — the photos, voice notes and locations from Phase 4 become a draft schedule.
- [ ] **Feed it any relevant document** — building plans, previous reports, specifications, asbestos registers, EPCs, structural or M&E reports, contractor quotes, the client's brief, correspondence. All of it is context for the draft.
- [ ] **Formats it accepts** — PDF, Word, Excel, images and plain text go in directly. CAD drawings go in as a PDF export, which is one click in the drawing package.
- [ ] **Scanned documents work** — a photographed or scanned PDF is read visually, so an old paper report or a marked-up plan is as usable as a clean digital one.
- [ ] **Say what each document is** — tag a file as lease, plan, previous report, specification and so on, so the draft knows what it's reading rather than guessing.
- [ ] **Choose what feeds a run** — tick which documents are context for this generation; the rest stay stored but out of the way.
- [ ] **Each type declares what it needs** — a schedule type lists the documents it requires and the ones it merely recommends, as part of its settings.
- [ ] **Required documents are enforced** — generation won't start without them. Dilapidations without a lease is blocked, because the claim is founded on the covenants and there's nothing to write against.
- [ ] **Blocked means helpful, not stuck** — the message names exactly what's missing and offers the upload there and then, rather than a greyed-out button with no explanation.
- [ ] **Recommended documents warn** — missing ones are listed with what they'd improve, and you can carry on regardless.
- [ ] **Override is deliberate and recorded** — a required document can be waived with a reason; the schedule carries that note so it's obvious later why it was drafted without one.
- [ ] **Checked before anything is spent** — the check runs before the job is queued, so a missing lease costs nothing rather than producing a useless draft.
- [ ] **Unreadable files caught** — a file tagged as a lease that turns out to be blank, corrupt or the wrong document is flagged at the same point, not silently treated as present.
- [ ] **Sensible defaults, yours to change** — ships with a starting set per type; if your mum wants licences for alterations required rather than recommended, that's a settings change.
- [ ] **Plans pre-fill the location list** — upload a floor plan and the rooms and elevations become the tagging list used on site, so capture is picking from a list rather than typing.
- [ ] **Upload once, reuse** — a document is uploaded once and referenced by every later run, rather than re-sent each time.
- [ ] **Lease-aware (dilaps)** — upload the lease, the relevant covenants are extracted, and each item cites the clause it breaches.
- [ ] **Priced automatically** — each item is matched to the cost library and costed, with the source shown.
- [ ] **Organised by location** — items grouped by building / elevation / room, in a sensible survey order.
- [ ] **Review table** — every field editable in place; reorder, merge, split and delete items; nothing is locked.
- [ ] **Evidence on every line** — click an item to see the photos, the voice note, and the document and page number it came from.
- [ ] **AI lines are flagged until checked** — each item shows whether a human has reviewed it, and a schedule warns you if you export with unreviewed lines.
- [ ] **Natural-language editing** — select some rows, type "make these more formal and add a scaffolding allowance", see the proposed changes as a diff, accept or reject.
- [ ] **Undo** — every edit, AI or manual, is reversible.
- [ ] **Export to Excel** — the working format, with formulas intact for totals.
- [ ] **Export to Word** — because the final tidy-up always happens in Word.
- [ ] **Export to PDF** — the client-facing version, from a template matched to the firm's existing schedules (dummy now, real one when you send an example).
- [ ] **Scott Schedule export** — the dilapidations dispute format with claimant/response columns, for when a job goes contested.
- [ ] **Photo appendix** — numbered plates, cross-referenced from the schedule lines.
- [ ] **Every export works for every type** — Excel, Word, PDF, Scott Schedule and photo appendix are available on any schedule, not tied to one type.
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

- [ ] **Built for an 8-inch Android tablet** — that's the site device. The capture screen is designed for a narrow screen held in one hand, not a desktop layout shrunk down.
- [ ] **The review table stays a desk job** — editing a 35-row schedule needs a real screen, and pretending otherwise would make both worse.
- [ ] **Fast on a bad connection** — small payloads, optimistic updates, nothing blocks on the network.
- [ ] **No data lock-in** — a single "export everything" button produces a zip of CSVs plus all files.
- [ ] **Import from the spreadsheet** — a one-off importer to bring existing clients and live jobs in on day one.
- [ ] **Never silently deletes** — deletes are soft; there's a bin you can restore from.
- [ ] **Cheap to run** — target under $25/month excluding AI usage, with a hard cap on AI spend.
- [ ] **Style is yours to set** — the current look is kept as a starting point; once it's working you tell me what to change and I change it.

---

## Appendix — starting document rules per schedule type

What each type requires before it will generate, and what it merely asks for. These are
the shipped defaults and all of them are editable in settings — **please correct them**,
you and your mum know this better than I do.

Site capture (photos and notes) is required for every type; it's the input the schedule
is actually built from.

| Schedule type | Required | Recommended |
|---|---|---|
| **Dilapidations — terminal** | Lease | Licences for alterations, schedule of condition at lease start, floor plan, previous correspondence |
| **Dilapidations — interim** | Lease | Licences for alterations, floor plan, previous schedules served |
| **Schedule of Condition** | — | Floor plan, lease (where it's to be annexed to one) |
| **Schedule of Works** | — | Client brief or specification, floor plan, cost information |
| **Schedule of Defects** | — | Contract specification, previous snagging list, floor plan |
| **Snagging list** | — | Floor plan, specification |
| **Planned maintenance** | — | Asset list, previous maintenance schedule, floor plan |

The only one I'm confident should be hard-blocking is the lease on a dilapidations
schedule: the claim is founded on the covenants, so without it there's nothing to write
breaches against. Everything else is a warning, on the grounds that a surveyor who wants
to press on usually has a reason.
