# Survello — End-User Requirements & Workflows

Companion to `REQUIREMENTS.md`. That file lists what gets built; this one describes
who uses it and how a real day actually goes.

Use it as the check on the checklist: **if a workflow below needs a step the checklist
doesn't cover, the checklist is wrong.**

---

## 1. Who uses it

Two people. But the significant split isn't *who* — it's *where*. The same person has
completely different needs at a desk and standing in a shut-up retail unit with no
signal.

| | **Desk mode** | **Site mode** |
|---|---|---|
| Device | Laptop, two screens | iPad or phone, one hand, gloves on |
| Connection | Fine | Often none |
| Session length | Half an hour | 10 seconds at a time |
| What's wanted | Overview, precision, editing | Capture speed and nothing else |

With two staff, roles blur completely. There is no point splitting permissions, and the
app should never ask "are you the surveyor or the admin?" — assume both people do
everything. This is why roles and permissions are deliberately absent from the
requirements.

---

## 2. Functional requirements, from the user's side

### A. "What do I need to deal with today?"
- See, in one place on opening the app, everything needing a decision today
- See what money is owed and how overdue it is
- See what work is in progress but unbilled
- Be told about deadlines *before* they matter, not on the day
- Get the same thing as an email, so it works without opening anything

### B. "I've had an enquiry"
- Record an enquiry in under a minute, from an email or a phone call
- Produce a quote without rebuilding the pricing each time
- Know which quotes are outstanding and how long they've been sitting
- Be prompted to chase, with the chaser already written
- Turn an accepted quote into live work without retyping anything

### C. "I'm going to site"
- Open the job and see the lease, previous photos, and what I'm there for
- Take photos fast, in sequence, without waiting for anything to upload
- Say what's wrong out loud rather than typing it
- Tag where I am in the building once, and have it stick for subsequent photos
- Work with no signal and trust that nothing is lost
- See how much is still waiting to upload

### D. "I need to produce the schedule"
- Turn what I captured on site into a draft schedule without retyping it
- Have each item reference the lease clause it breaches
- Have each item priced, from rates I control and can see the source of
- Edit anything — wording, price, order, grouping — without fighting the tool
- Fix ten items at once by describing the change rather than editing each
- See which photo and which voice note each line came from
- Be stopped from sending something I haven't actually read
- Export in the format the recipient expects: Excel to work in, Word to finish in,
  PDF to send
- Reproduce exactly what I issued, months later, in a dispute

### E. "I need to get paid"
- Track time without thinking about it, including when I forget to start the timer
- Know whether a job is profitable *while* it's running
- Turn time into an invoice in one step
- Send the invoice without leaving the app
- Know who hasn't paid, and chase them

### F. "Where's that email?"
- Find all correspondence on a job without searching Outlook
- Have attachments filed automatically
- Reply from the app and have the thread stay intact in Outlook
- Search one box and find it, whether it's an email, note, photo or schedule line

### G. "Don't let me miss anything"
- Lease expiries, break dates, service deadlines, response deadlines — with warning
- Quotes going cold
- Invoices going unpaid
- Jobs that have gone quiet

---

## 3. Example workflows

### Workflow 1 — Enquiry to instruction
*Desk. About ten minutes of actual work, spread over three weeks.*

**Monday.** An email arrives from a managing agent: *"Can you quote for a terminal
schedule of dilapidations on Unit 4, 118 High Street — lease expires 31 March."*

1. The email appears in Survello, unmatched. A banner offers **Create lead from this**.
2. One click: lead created, client matched to an existing managing agent record, the
   email attached, the property address parsed out.
3. Add the fee — £1,450 — and the instruction type. Quote generated, PDF attached to a
   draft reply.
4. Read it, adjust a sentence, send. It goes out through Outlook so it sits in the real
   thread.
5. Quote marked **sent** automatically.

**Two weeks later.** No reply. The dashboard shows *"1 quote awaiting reply — 14 days."*

6. Click it, hit **Draft chaser**. A polite follow-up referencing the original is
   written. Edit, send.

**Three days later.** They accept.

7. Mark the quote **accepted**. One button creates the instruction: client, property,
   fee and type all carried over. Nothing retyped.
8. Add key dates: lease expiry 31 March, and *"schedule must be served by 31 January"*
   with a six-week warning.

### Workflow 2 — The site visit
*Site. Ninety minutes on site, no signal.*

Unit 4 is a shut-up retail unit. No wifi, patchy 4G at the back.

1. The night before, open the job on the iPad. The lease and previous correspondence
   cache locally.
2. On site, tap **Start capture**. Set location to *Ground floor — Front of shop*.
3. Photograph the shopfront. Hold the mic button: *"Powder-coated aluminium shopfront,
   paint finish failed on the lower section, corrosion to the threshold. Tenant covenant
   to keep in repair and redecorate in the final year."*
4. Next photo, same location, another note. Repeat — forty photos in an hour.
5. Change location to *Rear storeroom*. Everything after that is tagged there
   automatically.
6. Ceiling tiles water-stained. Photo, note: *"Water staining to suspended ceiling
   tiles, approximately twelve tiles, source appears to be a historic roof leak — check
   landlord's repairing obligation."*
7. Walk out. The header says **"63 items waiting to upload."** Get in the car, hit 4G on
   the main road, it drains to zero.

Nothing was typed all morning.

### Workflow 3 — Draft to issued schedule
*Desk. The core of the product, and where the afternoon used to go.*

1. Open the job. 63 photos, 41 voice notes, grouped by location, transcribed.
2. Upload the lease PDF. Covenants extracted — repair, decoration, yield-up, statutory
   compliance.
3. **Generate schedule → Terminal dilapidations.**
4. A few minutes later: a draft of around 35 items, grouped by location in survey order.
   Each has element, breach, remedy, clause reference and a cost from the rate library.
5. Review. Item 12's cost is nonsense — the rate matched "redecoration" generically. Fix
   it inline; the cost library learns it.
6. Items 18–24 are all the storeroom ceiling. Select them, then type: *"combine these
   into a single item covering the whole suspended ceiling, and add an allowance for
   access equipment."* A diff appears. Accept.
7. Item 27 cites the wrong clause. Click the item, see the source photo, hear the
   original note, correct it.
8. Select the whole schedule: *"make the wording more formal and consistent with a
   landlord's terminal schedule."* Diff. Accept most, reject two where it has lost the
   specifics.
9. Three items still show **unreviewed**. Read them. Two are fine; one is wrong — delete
   it.
10. **Export → PDF** with the photo appendix, plates numbered and cross-referenced.
11. Mark **issued**. Frozen snapshot taken.
12. Draft covering email, PDF attached, sent through Outlook.

Any later edit creates version 2. The issued version stays readable forever — which is
the part that matters if the tenant's surveyor disputes it in June.

### Workflow 4 — Getting paid
*Desk. Five minutes, monthly.*

1. Dashboard: **WIP £4,280**. Click it.
2. Unit 4 shows 11.5 hours logged against a £1,450 fixed fee — an effective rate of
   £126/hr. Fine.
3. **Invoice job → fixed fee, 100%.** Invoice drafted, numbered, VAT applied.
4. PDF attached to a draft email. Sent.
5. **Six weeks later.** Dashboard: *"Aged debtors — £1,740 over 60 days."*
6. Click through, **Draft chaser**, send. Payment arrives; mark paid, balance clears.

### Workflow 5 — Monday morning
*Two minutes, before the kettle boils.*

The 7am email:

> **3 things today**
> — Quote to Harrison & Co, 18 days no reply
> — Unit 4 schedule due to be served in 12 days
> — Invoice 2026-041, £1,740, 63 days overdue
>
> WIP £4,280 · Debtors £3,120 · 4 jobs live

Open the app, three clicks, three chasers drafted.

---

## 4. What these workflows imply for the build

Two things fall out that are worth stating plainly, because they drive decisions
elsewhere.

**Everything hinges on Workflow 2 working.** If offline capture is even slightly
unreliable, she will take photos on the normal camera app instead — and then Workflow 3
has no input and the schedule engine is worthless. That is why offline capture is
Phase 4, *before* schedules, and why the "63 items waiting" counter is not cosmetic.

**Workflow 3, step 9 is the step that protects her.** Everything else in the product is
convenience. The unreviewed-items gate is what stops an AI-invented defect going out
under her name to a managing agent. It should be slightly annoying, and it should not be
possible to turn off.
