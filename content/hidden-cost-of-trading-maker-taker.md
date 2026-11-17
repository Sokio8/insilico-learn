---
title: "The Hidden Cost of Trading: Maker vs Taker Fees, Spread and Limit Chase"
slug: hidden-cost-of-trading-maker-taker
category: Execution
cover: chase
theme: black
short: "The Hidden Cost of Trading"
level: Beginner
step: 2
excerpt: "Taker fees, spread and slippage quietly tax every active trader. Learn maker vs taker execution and how Limit Chase works a passive order."
docs:
  - title: "Chase"
    url: "https://docs.insilicoterminal.com/documentation/limit-tab/chase"
  - title: "Limit"
    url: "https://docs.insilicoterminal.com/documentation/limit-tab/limit"
  - title: "Chase Orders (CLI)"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/chase-orders"
  - title: "Simple Ordering (CLI)"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/simple-ordering"
  - title: "Swarm"
    url: "https://docs.insilicoterminal.com/documentation/market/swarm"
---
Most traders log their entries, exits and PnL. Hardly anyone logs what it cost to get in and out. Every market order charges you a taker fee, the spread you cross and whatever slippage your size causes. None of that prints as a red candle, so it's easy to ignore, and for an active trader it can add up to more than the edge itself. Here's each cost with the math worked through, followed by how to work passive orders with Limit Chase in Insilico Terminal.

## Three Costs You Pay on Every Trade

### Fees

Exchanges take a percentage of notional on every fill. Most split that into a maker rate for orders that rest on the book and add liquidity, and a higher taker rate for orders that remove it. Some venues even pay makers a small rebate. Fees are quoted in basis points (bps), and 1 bp is 0.01%.

### Spread

The spread is the gap between best bid and best ask. Buy at market and you pay the ask; sell at market and you get the bid. Measured from mid, a market order gives up half the spread going in and half coming out.

### Slippage

If your order is bigger than what's sitting at the best price, it chews through several levels of the book and your average fill lands worse than the price you saw when you clicked. More size means more slippage. More depth means less.

![Insilico Terminal Orderbook with depth bars on bids and asks around the mid price](/learn/assets/figures/ui-orderbook.png "The depth bars show how much size sits at each level before your order starts walking the book.")

If you always use market orders, you pay all three on both legs. Rest limit orders instead and you pay the maker rate, earn the spread rather than paying it, and cause no slippage when you get filled. The catch is that a resting order might never fill.

## A Worked Fee Example

These numbers are made up for illustration, not taken from any exchange's schedule. Check your own venue and tier.

Say the taker fee is 4.5 bps, maker is 1.5 bps, the spread is one tick worth about 1 bp, and you're trading $50,000 notional. You open and close once.

```bars
title: Cost of one $50,000 round trip
unit: $
caption: Taker: 2 x 4.5 bps fees, 1 bp spread, about 1 bp slippage. Maker: 2 x 1.5 bps fees, no spread or slippage at fill.
All taker: Fees 45, Spread 5, Slippage 5
All maker: Fees 15
```

That's $40 per round trip. Do ten a day at that size and it's $400 a day, roughly $8,000 across a 20-day month. On a $100,000 account you're spending 8% a month on execution before you've been right or wrong about anything.

Look at it from the strategy side too. Targeting 15 bps a trade, you keep about 4 bps after 11 bps of taker cost, or about 12 bps if you execute passively. The smaller your target and the higher your turnover, the more execution decides whether you make money.

## Maker vs Taker: What Actually Decides It

The label on the order doesn't decide whether you pay maker or taker. What the order does when it hits the book does.

- A limit priced through the other side of the book fills straight away and pays taker.
- A limit that rests and gets filled later by someone else pays maker.
- A post-only order gets rejected or adjusted by the exchange if it would fill immediately, so it can only ever be a maker order.

In Insilico Terminal, the Limit order has a **Post** switch that makes sure the order goes in as maker. The **Best Bid/Ask** switch fills in the price at your side of the spread and also sends the order as Post Only, which helps you avoid taker fees. In the CLI, `best` places the order at the top of the book the same way.

![Limit order form with Post, Reduce and TP/SL switches and the Best toggle next to the price](/learn/assets/figures/ui-limit.png "Post sits under the price field, and the Best toggle next to the price label fills in your side of the spread.")

```cli
# limit buy 0.1 at the best bid
buy 0.1 best
# limit sell $10,000 at the best ask
sell 10000$ best
```

The trouble with a static limit is that the market moves. Price ticks away from your bid and the fill never comes. Re-pricing by hand is slow and you'll fat-finger it eventually. Chase does that job for you.

## How Limit Chase Works

Chase puts a limit order at the best bid or ask and keeps moving its price to follow the quote until it fills, you cancel it, or it hits a maximum chase distance. You stay on your side of the book as price moves, with no clicking.

The settings you'll use:

- **Chase To** is the worst price you'll accept. Set 0.5% on a buy started at 10,000 and the order follows the bid up to 10,050 and stops there. The red and green boxes in the panel show the maximum adverse price for each side.
- **Until Fill/Cancel** removes that limit, so the order follows the quote until it fills or you cancel.
- **Keep Order** leaves the order resting as a plain limit if you cancel the chase.
- **Priority** chases the opposite side's quote +/- 1 tick instead of the top of your own side. Turn it on when getting filled matters more than staying passive.
- **Reduce** and **TP/SL** behave the same as on other order types.

You can run several chases at once and watch them in the Orders component.

![Limit Chase form with Until Fill/Cancel, Stalk Mode, Keep Order, Priority, Reduce and TP/SL switches](/learn/assets/figures/ui-chase.png "With Until Fill/Cancel on, the chase follows the quote with no distance limit until it fills or you cancel.")

```cli
# chase a 0.5 buy until it fills or you cancel
chase buy 0.5
# chase a $5,000 sell, giving up 0.1% at most
chase sell 5000$ to 0.1%
# close half a long with a chase
chase sell 50% reduce
# stop chasing but leave the order on the book
chase cancel keep
```

> **Terminal tip:** Keep your Chase To distance smaller than your expected edge. Target 20 bps and let the chase walk 50, and you can pay more in adverse price than a market order would have cost you.

### Stalk Mode

Stalk sits the chase a set number of ticks or percent away from the best bid or ask instead of right on it. **Maintain** holds that distance whichever way the quote moves. **Trail** only moves your order toward the market, the way a trailing stop does. It's handy for a bid under the market that rises with price but never drops back, so you can catch a wick without leaving a static order lying around. Be aware that Maintain can still fill in volatile moves, more so with a tight distance.

## When Chase Is the Wrong Tool

Chase is for patient fills in normal conditions. A few situations turn it against you.

### Fast Breakouts

When price runs, the touch moves faster than a passive order can keep up with. Your chase keeps repricing a step behind, then either hits its Chase To limit without filling or fills well past the level you wanted. If being in the trade matters more than the fee, just use a market order or a Swarm.

### Adverse Selection

Passive orders fill easiest when the market is moving through them. If your bid fills instantly while price is falling, there's a good chance price is about to go lower. Maker fills cost less in fees, but they still carry an information cost.

### Stops and Exits Under Stress

When a position is going against you, a chase that doesn't fill is worse than paying taker. If protecting capital comes first, close with a market or reduce-only order.

> **Risk note:** Saving 3 bps on fees won't help you if leverage and a missed exit cost you 300. Don't let execution style override your stop. Size so that a market exit at a bad price is something you can survive.

## A Practical Routine

Start with a simple rule set and tune it to your venue's fees.

1. Entries with no urgency: Limit with Post, or Best Bid/Ask.
2. Entries you want filled within seconds to minutes: Chase, with a Chase To distance below your edge.
3. Entries on breakouts or news: market, or split it with Swarm if the size is large.
4. Taking profit: resting reduce-only limits at your targets.
5. Stops: market, every time.

Track realised fees every week. If taker fees are eating a big share of gross PnL, fix your execution before anything else.

## Frequently Asked Questions

### What is the difference between a maker and a taker?

A maker adds liquidity by resting an order that someone else fills later. A taker removes liquidity by filling against an order that's already on the book. Most exchanges charge takers more than makers, and some pay makers a rebate.

### Does Limit Chase guarantee maker fees?

No. By default Chase follows the best bid or ask on your side, which keeps it passive in normal conditions, but the fee depends on how each fill actually happens on the exchange. Priority deliberately chases the opposite side's quote, giving up passivity for fill speed. If fees matter to your strategy, check them on your fills in the exchange's trade history.

### What happens when a chase reaches its Chase To price?

It stops following the quote. To keep the order resting as a normal limit after the chase is cancelled, use the Keep Order switch, or `chase cancel keep` in the CLI. With Until Fill/Cancel on, there's no Chase To limit at all.

### When should I just use a market order?

When missing the trade would cost you more than crossing the spread. Breakouts, news and stop-outs are the usual cases. For large size, splitting the market order with Swarm or TWAP cuts slippage and still guarantees execution.

### How do I calculate my real cost per trade?

Add the fee on both legs, half the spread on each taker leg, and the slippage between the price you saw and your average fill. Put everything in basis points of notional so you can compare it straight against your per-trade target.
