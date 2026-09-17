# Survello — What's Needed to Build It Straight Through

Everything required to build all eight phases without stopping to ask questions.

Work through it top to bottom. Section A is the hard blocker — nothing deploys without
it. Section D matters more than it looks: every unanswered question there is a point
where I'd otherwise have to stop and ask.

**Never paste keys or secrets into chat.** Everything marked 🔑 goes into GitHub Actions
secrets (repo → Settings → Secrets and variables → Actions) or the server's environment
file. I'll write the code to read them from there; I never need to see the values.

---

## A. Accounts and access — blocks deployment

- [ ] **AWS account**, billing set up, root MFA enabled
- [ ] 🔑 **IAM user with programmatic access** — permissions for Lightsail, S3, and
      Route 53 (only if using a domain). Access key ID + secret into GitHub secrets.
- [ ] **Domain name** purchased — or tell me to run on the raw Lightsail IP for now
      (perfectly fine to start; swapping to a domain later is a config change)
- [ ] 🔑 **Anthropic API key**, billing enabled, with a monthly spend limit set on the
      account as a backstop behind the app's own cap
- [ ] 🔑 **OpenAI API key**, billing enabled, spend limit set — used only for voice
      transcription
- [ ] **GitHub Actions enabled** on the repo
- [ ] 🔑 **Sentry account + DSN** — free tier, about two minutes, optional but worth it
- [ ] 🔑 **Microsoft Entra app registration** — client ID, tenant ID, client secret, with
      admin consent granted for the mail scopes. Needs whoever administers the Microsoft
      365 tenant. *Only blocks Phase 7; everything before it builds fine without.*

## B. The firm's details and content — makes it correct rather than generic

- [ ] **Registered firm name, trading address, VAT number**
- [ ] **Bank details** as they appear on invoices
- [ ] **VAT registered?** If not, VAT disappears from the invoice entirely
- [ ] **Invoice number format** and the next number to issue (so it continues her
      existing sequence rather than restarting)
- [ ] **Payment terms** — 30 days, 14, on receipt
- [ ] **Logo, letterhead, fonts, brand colours** — whatever exists
- [ ] **A real invoice**, redacted. Two if the firm bills both hourly and fixed-fee
- [ ] **A real example of each schedule type** she produces — the **Word or Excel
      originals**, not PDFs, so the structure and styling can be matched rather than
      guessed at
- [ ] **Hourly charge-out rate for each of the two people**
- [ ] **Mileage rate** in pence per mile
- [ ] **How she quotes** — the basis for pricing a job, even if it's rules of thumb
- [ ] **Which sources she trusts** for materials and labour rates, with URLs if any.
      This seeds the cost library and the research agent
- [ ] **Her job stages**, named as she actually uses them
- [ ] **The spreadsheet she currently tracks jobs in**, plus the client list — for the
      day-one importer
- [ ] **Five to ten sent emails** covering each step: quote, chaser, instruction
      acknowledgement, schedule issued, invoice chase. These teach the drafts to sound
      like her rather than like a chatbot

## C. Test fixtures — the difference between "built" and "works"

This is the section that decides whether the schedule engine is any good.

- [ ] **One complete real job, anonymised** — the lease PDF, every site photo, the floor
      plan, any voice notes, **and the finished schedule she produced from them**
- [ ] **A second complete job** of a different schedule type
- [ ] **One awkward document** — a scanned or photographed lease, a bad fax, a marked-up
      plan. The messy path is the one that breaks

Without these I can build the pipeline but cannot tell whether its output is worth
reading. "Produces a plausible schedule a surveyor would have to rewrite from scratch"
is the failure mode that makes the entire project pointless, and it is invisible without
a real before-and-after to measure against.

## D. Decisions — every unanswered one is a stop

- [ ] **Does she survey location-by-location or element-by-element?** (all of a room,
      then the next room — or all the windows, then all the doors). This shapes the
      capture UI, which everything downstream depends on
- [ ] **Microsoft 365 or Google Workspace?**
- [ ] **Which tablet** — iPad or Android, and roughly what size
- [ ] **Does the second person need different access, or identical?** (identical is my
      assumption, and simpler)
- [ ] **Keep the name and the current look**, or restyle?
- [ ] **GBP only?** (assumed)
- [ ] **Is there any live data** in the current system to preserve, or is this truly a
      clean start? (assumed clean)
- [ ] **What should happen when the AI spend cap is hit** — hard stop, or warn and
      continue? (hard stop assumed)

## E. Steps that need a human, whatever I do

Not things I can prepare away. Budget about an hour total, ideally before I start:

1. **Creating the AWS account** — card details, MFA, identity verification
2. **Buying the domain and pointing DNS** at the server
3. **The Entra app registration and admin consent** — a consent screen someone has to
      click, on an account with tenant admin rights
4. **The first Microsoft sign-in** that connects the mailbox — an OAuth flow in a real
      browser, as the mailbox owner
5. **Installing the app on the actual iPad** and trying it somewhere with no signal

I'll write step-by-step instructions for each. None is difficult; none can be automated
away from this side.

---

## What I can and can't verify myself

Worth being straight about, so there are no surprises at the end.

**I can test:** everything server-side, the whole UI in a browser, offline behaviour
with the network disabled in Chromium, document generation end to end, all exports.

**I can't test:** the app on a real iPad, in a real building, with real intermittent
signal, held in one hand. Phase 4 needs a real site visit to be trusted, and that visit
is the one thing standing between "offline capture works in a simulated environment" and
"offline capture works."

**I can't judge without Section C:** whether the generated schedules are good.

---

## Priority, if you can't gather all of it at once

| Give me | And I can build |
|---|---|
| **A** (minus Entra) **+ D** | Everything through Phase 6, deployed and working |
| **+ B** | The same, but correct for the firm rather than generic |
| **+ C** | The same, with the schedule output actually validated |
| **+ Entra** | Phase 7, email |

Sections A and D alone unblock the great majority of the build. B and C determine
whether what comes out is usable on a real job or a convincing demo.
