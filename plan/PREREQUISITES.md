# Survello — What's Needed Before the Build

Three parts:

1. **Jobs for you** — accounts and keys. About an hour.
2. **Decisions** — a numbered list you can answer in one message.
3. **What to ask your mum** — written so you can forward it as-is.

Sections 1 and 2 unblock everything through Phase 6. Section 3 is what makes the output
usable on a real job rather than a convincing demo.

---

# Part 1 — Jobs for you

**Never paste keys or secrets into chat.** Everything marked 🔑 goes into the repo's
GitHub Actions secrets (Settings → Secrets and variables → Actions). I write the code to
read them from there and never need to see the values.

### Accounts (~45 minutes)

- [ ] **AWS account** — sign up, add a card, turn on MFA for the root account
- [ ] 🔑 **AWS access key** — create an IAM user with permissions for Lightsail, S3 and
      Route 53. Put the access key ID and secret into GitHub secrets
- [ ] 🔑 **An AI provider key** — get **both** if it's easy, since which one is used for
      schedule generation gets decided by measurement in Phase 6:
      - **Google AI Studio** — has a free tier a two-person firm may well stay inside
        for the cheaper tasks
      - **Anthropic** — console.anthropic.com
      Add billing and **set a monthly spend limit** on each, as a backstop behind the
      app's own cap
- [ ] ~~OpenAI API key~~ — **no longer needed.** Voice notes are transcribed by the same
      model that does everything else, so the project has one AI vendor rather than two
- [ ] **GitHub Actions enabled** on this repo
- [ ] 🔑 **Sentry DSN** — free tier, about two minutes, catches crashes. Optional

### Later, only for Phase 7 (email)

- [ ] 🔑 **Microsoft Entra app registration** — client ID, tenant ID, client secret, with
      admin consent for the mail scopes. Needs whoever administers the firm's Microsoft
      365. Nothing before Phase 7 depends on this, so it can wait
- [ ] **The first mailbox sign-in** — an OAuth flow your mum clicks through in a browser,
      as the mailbox owner

### Things only a human can do, whatever I build

Not blockers to start, but they can't be automated away, so budget for them:

1. Creating the AWS account (card, MFA, identity verification)
2. Buying a domain and pointing its DNS, if you want one
3. The Entra registration and admin consent
4. The first Microsoft sign-in
5. Installing the app on the actual Android tablet and trying it somewhere with no signal

---

# Part 2 — Decisions

**All answered.** Recorded here so the reasoning is on file.

| # | Question | Answer |
|---|---|---|
| 1 | Domain | **survelloapp.com**, registered through Vercel. An A record points at the Lightsail IP; nothing is hosted on Vercel |
| 2 | Email provider | **Microsoft 365** — Graph API, as planned |
| 3 | Site device | **Android tablet, roughly 8 inches.** Capture UI designed narrow and one-handed |
| 4 | Survey method | **Location by location** — finish a room, move on. Capture tags everything to the current location until it's changed |
| 5 | Access levels | **Two roles.** Jaye sees the money the client sees — job fees, quotes, invoices, payments — but never a charge-out rate or any figure that prices his own output. Material and labour rates stay visible; they're needed to do the job |
| 6 | Name and look | Keep both for now |
| 7 | VAT registered | **Yes** — VAT on invoices throughout |
| 8 | AI spend | **Warn, don't block.** Spend to date visible on the dashboard only, never priced at the point of use. Plus a runaway ceiling far above the budget that does stop, to catch bugs rather than ration work |
| 9 | Existing data | Clean start |
| 10 | Currency | GBP only |

### Still outstanding from this section

- [ ] **Point DNS at the server** — once the Lightsail instance exists, add an A record
      for `survelloapp.com` (and `www`) in Vercel's DNS settings. I'll give you the IP
      and the exact records to paste

# Part 3 — What to ask your mum

Everything below is copy-and-send. It's in plain language deliberately.

> ### Things I need to build the surveying app
>
> No rush on any of it — send what's easy first.
>
> **On confidentiality:** for anything with a client's details on it, feel free to black
> out or change names, addresses and figures. I only need the *shape* of the documents,
> not the real details. Nothing gets shared outside the app, which only you and I will
> ever use.
>
> **Business bits**
> - Firm's registered name and address as they appear on invoices
> - VAT number, if you're VAT registered
> - Bank details as they appear on an invoice
> - What your invoice numbers look like, and what number you're up to — so the app
>   carries on your sequence instead of starting again
> - Your payment terms (30 days? 14? on receipt?)
> - Your hourly rate, and the other person's
> - What you charge per mile for travel
>
> **Examples of your documents** — the most useful thing on this list
> - An invoice you've actually sent (two if you bill some jobs hourly and some at a
>   fixed fee)
> - An example of **each type of schedule** you produce — dilapidations, condition,
>   works, whatever else
> - **Please send the Word or Excel originals, not PDFs.** I need to see how they're
>   built, not just how they look
> - Your logo and letterhead, if you have files for them
>
> **How you actually work**
> - The stages a job goes through, in your words — whatever you'd write at the top of a
>   spreadsheet column
> - How you decide what to quote for a job, even if it's rules of thumb
> - Where you look up prices for materials and labour — books, websites, or just
>   experience. Links if there are any
> - The spreadsheet or list you currently track jobs in — as-is, however messy
>
> **A few emails**
> - Five to ten emails you've sent covering: quoting for a job, chasing a quote that's
>   gone quiet, acknowledging an instruction, sending a finished schedule, chasing an
>   unpaid invoice
> - This is so the app drafts emails that sound like you, rather than like a robot
>
> **One complete job — the important one**
>
> Everything from a single job you've finished:
> - The lease
> - Every photo you took on site
> - The floor plan
> - Any voice notes or site notes
> - **And the finished schedule you wrote from them**
>
> This is the one that decides whether the app is any good. With a real before-and-after
> I can check whether what it produces is close to what you'd have written yourself.
> Without it I'm guessing, and we'd only find out at the end. A second job of a different
> type would be even better.
>
> If you have one where the paperwork was a nightmare — a scanned lease, a bad photocopy,
> a plan someone had scribbled on — that's genuinely useful too. The messy ones are what
> break it.
>
> That's everything — no questions outstanding.

---

## Priority, if it can't all happen at once

| Have | Can build |
|---|---|
| Part 1 accounts + Part 2 answers | Everything through Phase 6, deployed and working |
| + the business bits and document examples | The same, correct for the firm rather than generic |
| + the complete real job | The same, with the schedule quality actually verified |
| + Entra registration | Phase 7, email |
