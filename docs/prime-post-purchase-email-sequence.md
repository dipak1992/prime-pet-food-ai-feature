# Prime Pet Food Post-Purchase Email Sequence

Use this sequence in the email platform connected to Shopify. The order page already renders the same education through `snippets/post-purchase-chew-education.liquid`.

## Email 1: Order Confirmed / What To Expect
Timing: immediately after purchase.

Subject: Your calmer chew routine starts soon

Content:
- Confirm the order.
- Explain that yak chews are for supervised enrichment sessions.
- Link to `/blogs/dog-behavior/how-long-do-yak-chews-last`.
- CTA: Open `/pages/my-dog`.

## Email 2: First Chew Session Guide
Timing: 1 day after fulfillment.

Subject: Start with a short supervised chew session

Content:
- Recommend a 15-30 minute first session.
- Remind customers to provide fresh water.
- Explain when to remove the small end piece.
- CTA: Log first session in `/pages/my-dog`.

## Email 3: Duration Check-In
Timing: 5 days after delivery.

Subject: How long did it last for your dog?

Content:
- Ask customer to log real chew duration.
- Route to the duration estimator.
- Suggest sizing up for power chewers.
- CTA: `/pages/how-long-will-this-last-for-my-dog`.

## Email 4: Reorder / Subscribe Prompt
Timing: based on My Dog reorder timing or 21 days after delivery.

Subject: Keep calm-time stocked

Content:
- Use dog profile data where available.
- Position Subscribe & Save as routine support, not discount pressure.
- CTA: `/pages/subscribe-and-save`.

## Email 5: Referral
Timing: 35 days after first purchase.

Subject: Share Prime Pet Food with another dog parent

Content:
- Ask for referral or duration report.
- Link to `/pages/refer-a-friend`.
- Link to review flow if available.
