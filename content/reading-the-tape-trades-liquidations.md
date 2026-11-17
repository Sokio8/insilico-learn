---
title: "Reading the Tape: Time and Sales, Aggressor Side and Liquidation Cascades"
slug: reading-the-tape-trades-liquidations
category: Order Flow
cover: tape
theme: white
short: "How to Read the Tape"
level: Intermediate
excerpt: "Read aggressor side, size clusters and liquidation cascades on the trade tape, and filter out the noise in Insilico Terminal."
docs:
  - title: "Trades + Liquidations"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/trades-+-liquidations"
  - title: "Aggr"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/aggr"
  - title: "DOM"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/dom"
  - title: "Orderbook"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/orderbook"
  - title: "Chart"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/chart"
---
The chart shows where price went, and the order book shows what people say they'll do. The tape shows what got done: every executed trade, its price, its size, and which side crossed the spread to make it happen. Reading the tape (time and sales) is the oldest order flow skill around, and crypto adds a stream most markets never show you: forced liquidations. Here's what to look for, how to set up the Trades + Liquidations and Aggr components, and where the tape will mislead you.

![Full Insilico Terminal workspace with Place Order, Chort, Orderbook, Trades + Liquidations, Market, Positions and Orders, Balances and CLI](/learn/assets/figures/ui-workspace-full.png "The tape sits next to the chart and order book, so you can read all three at once.")

## What the Tape Records

Each line on the tape is one fill, with at least a timestamp, a price, a size and a side. The side is what you're reading for.

Every trade has two parties. One had an order resting in the book (the maker). The other sent an order that crossed the spread and hit it (the taker, or aggressor). The tape colours each print by the aggressor:

- **Green / buy:** a taker bought, lifting a resting ask.
- **Red / sell:** a taker sold, hitting a resting bid.

Takers pay for urgency. Someone who lifts the offer instead of waiting on the bid wants the position now. A steady run of aggressive buys says demand is impatient; a steady run of aggressive sells says the same about supply.

Most newer traders read "more buys than sells" as bullish. But every trade has exactly one buyer and one seller, so volume always balances. The imbalance is in who was in a hurry.

## Four Patterns Worth Learning

### 1. Size Clustering

Look for prints much larger than the flow around them, or lots of identical sizes landing in quick succession. A run of same-size fills a few hundred milliseconds apart usually means an algo slicing a parent order. If it keeps coming at the same rhythm, whoever's behind it isn't done.

### 2. Absorption

Aggressive sellers keep hitting the bid, the prints are big, and price won't go down. Someone is soaking up the selling with passive bids, maybe refilling them as they get eaten. Few signs tell you more clearly that a level is being defended. Flip it for aggressive buying into an offer that won't move.

### 3. Exhaustion

This is absorption's opposite. After a strong move the prints shrink and slow down. Aggressors are still around, just with less size and less often, and the move is running out of fuel. On its own that's not a reversal signal, only a sign the push is fading.

### 4. Liquidation Cascades

In perps, when an account falls below maintenance margin, the exchange's liquidation engine closes it with a market order. That forced order is aggressive too, so it pushes price further and can tip the next account under its threshold. You get a cascade: a burst of liquidations on one side, fast price movement, and often a sharp snapback once the forced flow is done.

This is where tape reading pays. Long liquidations into a level where the tape also shows bids absorbing are a very different picture from long liquidations into an empty book.

## The Trades + Liquidations Component

Our Trades + Liquidations component shows recent trades and liquidations for the selected instrument, with liquidations marked by a skull icon so they stand out from regular fills. You can:

- Show notional value in **USD or in coin**.
- **Aggregate across exchanges** with Aggregated (Options > Data), so flow for the same instrument from several venues lands in one stream.
- Set **minimum sizes** in Trades Options (filter icon), one for trades and one for liquidations. Anything under the threshold is hidden.

![Trades + Liquidations component streaming BTC-USDC prints with price, USD size and age, plus V and Δ in the footer](/learn/assets/figures/ui-trades-liquidations.png "Green prints lifted the ask and red prints hit the bid, and the footer sums volume (V) and delta (Δ) for the stream.")

The minimum size filter is the setting to get right. On a liquid major during an active session, an unfiltered tape scrolls faster than anyone can read. Raise the threshold until the tape moves at a pace where each line means something.

A decent starting point is roughly the size that would move the top level of the book. If the best bid and ask usually hold $50,000 each, prints under $5,000 are noise for this purpose. Tune it per instrument; the right number for BTC is wrong for a mid-cap.

> **Terminal tip:** Keep two copies of the component on screen. One with a high USD threshold shows only whale prints and liquidations; one with a low threshold shows rhythm. Give both the same [link colour](https://docs.insilicoterminal.com/documentation/application-elements/workspace/link-system) so they follow the same symbol.

## Aggr: Aggregation, Analytics and Sound

Aggr is the heavier tool, built for trade aggregation, advanced analytics and sound feedback. You can run it as a plain trades stream with audio or expand it into a full market monitoring view.

![Aggr component with an aggregated BTCUSD 5s candle chart, volume bars underneath and a colour-coded trade list on the right](/learn/assets/figures/ui-aggr.png "Aggr merges BTCUSD flow from several venues into one 5s chart, with each exchange's prints listed alongside.")

Don't skip the sound. Once you've learned it, you can hear a burst of aggressive buying or a liquidation wave while your eyes stay on the chart or the DOM, instead of staring at a scrolling list.

For a quicker start, we recommend the community presets in the aggr-templates repository. To import one: green button (bottom right) > Settings > "+ New" > "Upload template file" > select the file > "IMPORT".

## Pairing the Tape With Other Components

The tape reads best next to other views. Pairings worth setting up:

- **Tape + order book.** Our Orderbook has a Pull/Stack meter that charts liquidity added and removed per side over time. Aggressive selling while bids are being *added* is absorption. Aggressive selling while bids are *pulled* is a book stepping out of the way.
- **Tape + DOM.** The DOM can show bought and sold volume, a delta profile and a volume profile at each price, plus a CVD (cumulative volume delta) figure in the footer. That turns moment-to-moment flow into a running record of where aggressors traded.
- **Tape + tick chart.** The Chart supports tick candles, where each candle closes after a fixed number of trades instead of a fixed time. In a cascade, a 200-tick chart prints many candles in seconds while a 1-minute chart shows one, so bursts of activity are much easier to see.

For positioning context, the [Market](https://docs.insilicoterminal.com/documentation/application-elements/market) component and the wide [Tickers](https://docs.insilicoterminal.com/documentation/application-elements/tickers-instruments) view show open interest and funding. A cascade that knocks open interest down hard has flushed leveraged positions. If open interest holds, there may be more to come.

## Where the Tape Lies to You

You're pattern-matching on incomplete data, so be honest about the gaps:

- **One venue isn't the market.** A big print on one exchange can be a small slice of total flow. Use cross-exchange aggregation when the instrument trades on several venues.
- **Liquidation feeds are incomplete.** Exchanges decide what they publish about forced orders, and some sample or batch it. Treat the liquidation stream as a lower bound, not a full count.
- **Large prints are ambiguous.** A big aggressive buy could be a new long, a short covering, or a hedge against a spot sale somewhere else. The tape shows the trade, not the intent.
- **Hidden liquidity.** Absorption can come from orders that never showed in the book. You see the effect on the tape, not the source.
- **Your own latency.** In a fast cascade, what you're seeing has already happened. Don't try to front-run a cascade with market orders from a browser.

> **Risk note:** Fading a liquidation cascade means catching a falling knife with leverage. If you do it, size small, set the stop before entry, and accept that some cascades don't snap back.

## Frequently Asked Questions

### What is the difference between the tape and the order book?

The order book shows resting limit orders, which are intentions that can be cancelled any moment. The tape shows executed trades: what changed hands and who started it. Read them together and you'll see whether visible liquidity is real or gets pulled when tested.

### How do I filter small trades in Insilico Terminal?

Open Trades Options (the filter icon) on the Trades + Liquidations component and set the minimum size, separately for trades and for liquidations. Anything below the threshold is hidden.

### Can I see trades from several exchanges at once?

Yes. Trades + Liquidations can aggregate across exchanges, and Aggr is built for trade aggregation. Check which venues the instrument trades on first, since aggregation only helps where the same market exists on more than one exchange.

### Do liquidations always mean price will reverse?

No. Cascades often overshoot and snap back, but they can keep going if the book is thin or open interest is still high. Look for absorption on the tape and a drop in open interest before you call a cascade finished.

### Why use sound for the tape?

Your eyes are busy. Aggr's sound feedback lets you hear bursts of aggressive flow while you watch the chart or the DOM. It takes a few sessions to learn, and after that it works like peripheral vision.
