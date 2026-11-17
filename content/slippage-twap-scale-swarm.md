---
title: "What Is Slippage? Splitting Size With TWAP, Scale and Swarm"
slug: slippage-twap-scale-swarm
category: Execution
cover: slippage
theme: white
short: "Split Size Without Moving Price"
level: Intermediate
excerpt: "Why large orders move price, how to estimate slippage from book depth, and when to split size with TWAP, Scale or Swarm in Insilico Terminal."
docs:
  - title: "TWAP"
    url: "https://docs.insilicoterminal.com/documentation/market/twap"
  - title: "Swarm"
    url: "https://docs.insilicoterminal.com/documentation/market/swarm"
  - title: "Scale"
    url: "https://docs.insilicoterminal.com/documentation/limit-tab/scale"
  - title: "TWAP Execution"
    url: "https://docs.insilicoterminal.com/documentation/cortex/twap-execution"
  - title: "TWAP Order (CLI)"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/twap-order"
  - title: "Chase TWAP"
    url: "https://docs.insilicoterminal.com/documentation/limit-tab/chase-twap"
---
Slippage is the gap between the price you expected and the average price you got. On a small order it's close to zero. On a big one it can be the largest cost of the trade, more than fees and spread put together, because the book only holds so much size at each price. You can estimate it from depth before you send anything, and you can cut it by letting TWAP, Scale or Swarm in Insilico Terminal break one large order into many smaller ones.

## Why Size Moves Price

An order book is just a stack of resting limit orders, asks above mid and bids below. A market buy fills against the lowest ask, then the next one up, and keeps climbing until the size is done. Every level you take is worse than the last.

Take this made-up ask side:

```book
title: Ask side, market buy of 10
side: ask
buy: 10
100.20 8
100.10 5
100.05 3
100.00 2
```

A market buy of 2 fills entirely at 100.00. A buy of 10 fills 2 at 100.00, 3 at 100.05 and 5 at 100.10, for an average of (200 + 300.15 + 500.50) / 10 = 100.065. You're 6.5 bps worse than the best ask on your screen, and your last fill was 10 bps away. Double the order and you're into the 100.20 level.

It gets worse once you're trading for real. Visible depth isn't guaranteed depth, since orders can get pulled the moment your first fill prints. And people watch the tape. A big print tells them someone's buying, and they move their quotes before your next order lands.

## How to Estimate Slippage Before You Trade

Before you send size, check the cumulative depth on your side of the book and work out how far price has to travel to absorb you.

- Add up resting size level by level until it covers your order. That level's price is your worst fill.
- Your average fill lands between the best price and that worst level, weighted by size.
- If your order is a big chunk of the visible depth within a few ticks, it's worth splitting.

In Insilico Terminal you don't have to work this out by hand. First switch the meter on: click the filter icon in the Place Order header and turn on **Liquidity Meter** in Place Order Options.

![Place Order Options popup opened from the filter icon, showing the Liquidity Meter toggle](/learn/assets/figures/ui-liquidity-meter-option.png "The filter icon in the Place Order header opens the options where the Liquidity Meter lives.")

Then open the **Liquidity** section in the Market order: enter your size and it shows the price a buy into the asks or a sell into the bids would reach, plus how far that is from the top of the book in bps and ticks. Near zero means the top levels absorb you. If those numbers jump as you raise the size, the book is thin for your order and it's worth splitting.

![Market order with the Liquidity section open for 3.4 BTC: buy into asks at 73,610, 0.41 bps and 3 ticks; sell into bids at 73,606, 0.00 bps and 0 ticks](/learn/assets/figures/ui-market-liquidity.png "For 3.4 BTC a buy walks 3 ticks (0.41 bps) into the asks while a sell fills at the top bid, so this size barely moves the book.")

The faster you need the fill, the more depth you eat in one go. Go slower and the book has time to refill between orders. Each splitting tool sits at a different point between those two.

## TWAP: Spread Size Across Time

TWAP means Time Weighted Average Price. In Insilico Terminal, a TWAP splits a Total Size into a number of Total Lots and sends them one at a time at regular intervals across a Total Time. The client-side TWAP runs anywhere from 5 minutes to 12 hours. You can keep trading while it works, watch progress in the Activity panel, and cancel whenever you like.

The stealth options deal with the other half of the problem, which is being seen.

- **Obfuscate** varies the timing and size of your lots, so they don't land on an exact clock as identical clips.
- **Price bounds** set an upper and lower price. If price leaves that range, the TWAP can pause until it comes back, abort, fire all remaining lots at once, or close the position as a stop or take-profit.
- **Chase TWAP**, on the Limit tab, works each lot with a chase order instead of a market order. **Chase duration** sets how long each lot may chase, and **Fallback** decides what happens to a lot that hasn't filled in time: **Market** sends the rest at market, **Add to next** carries it into the next lot.

```cli
# buy 1 of the current instrument in 10 lots over 10 minutes
twap buy 1 into 10 over 10
# sell $100,000 of btcusdt in 100 lots over 4 hours
twap sell 100000$ btcusdt into 100 over 240
# unwind the full position in 60 lots over an hour
twap sell 100% into 60 over 60 reduce
```

> **In the docs:** closing the Terminal ends a client-side TWAP. For longer runs, Cortex executes TWAPs on the server with no upper duration limit, so your browser doesn't have to stay open. Cortex TWAPs add a per-lot slippage tolerance and can execute each lot with Chase or Swarm.

Reach for TWAP when your size is big relative to depth, you've got hours rather than seconds, and you care more about average price than about hitting one exact level. What you pay for it is drift. If price trends against you during the run, later lots fill worse, and price bounds are how you keep a lid on that.

![Market TWAP form: 1 BTC over 3h 38m in 19 lots of 0.05263 every 12 minutes, with Reduce, Obfuscate and Price Bounds](/learn/assets/figures/ui-twap.png "Set Total Time and Total Lots, and the form shows the size of each lot and how often one goes out.")

## Scale: Rest Size Across a Price Range

Scale (a ladder, if you prefer) places a set of limit orders across a price range. Total Size gets split across Total Orders, so 50 in 10 orders gives you 10 orders of 5. You set the two ends by typing them, clicking the chart, or dragging the range in the Designer. Total Orders runs from 2 up to 100 on Bybit or 50 on Binance.

Two controls shape the ladder:

- **Price Distribution** spaces orders evenly or bunches them toward the low or high end using a Cubic or Exponential curve. Exponential is the more extreme of the two.
- **Size Distribution** skews how much size sits at each order, so you can stack more deeper in the range.

Scale works differently from TWAP and Swarm because it provides liquidity instead of taking it. Since you set the prices, there's no slippage at the moment of fill, and resting orders usually get maker fees. Your risk is the fill itself. If price never reaches the ladder you get nothing, and if it slices through the whole thing you're filled into a move that kept going.

> **Terminal tip:** Skew a buy ladder so more size sits at the lower prices. If the market only tags the top of the range you end up with a small position, and if it trades through, your average entry sits well below where you started.

Scale fits when you've got a price zone in mind and time to wait, like accumulating into support or scaling out of a position into strength.

![Limit Scale form from 73,500 to 72,800 with 20 orders and the Skew panel set to Size +44% for an average of 72,911](/learn/assets/figures/ui-scale.png "Skewing size +44% toward the low end pulls the average entry down to 72,911 on a 73,500 to 72,800 ladder.")

## Swarm: Split One Market Order Into Many

Swarm breaks a large market order into smaller pieces. You give it a Total Size, it splits that into Total Lots, and it fires them in parallel as fast as it can. The **Obfuscate** switch varies lot sizes, which can help mask detection. **Reduce** makes every lot reduce-only.

This is the tool for when you need the whole size now. The lots go out together, so the book gets no time to refill between them, and Swarm won't conjure depth that wasn't there. It changes how your size reaches the book (lots of smaller orders rather than one block), and if you need a fill in seconds, you accept that.

Use Swarm when urgency matters more than price: a breakout, a news move, an exit you can't put off. If it can wait a few minutes, use TWAP.

![Market Swarm form with Total Lots set to 10 and Reduce, TP/SL and Obfuscate switches](/learn/assets/figures/ui-swarm.png "Total Lots sets how many pieces the market order is split into before they fire together.")

## TWAP vs Scale vs Swarm

| | TWAP | Scale | Swarm |
|---|---|---|---|
| What it does | Executes lots one by one at intervals over time | Rests many limit orders across a price range | Executes lots in parallel, as fast as possible |
| Liquidity | Takes (market lots, or chase lots with Chase TWAP) | Provides | Takes |
| Time to fill | 5 minutes to 12 hours client-side; longer with Cortex | Unknown, depends on price | Seconds |
| Main risk | Price drift during the run | No fill, or filled into a trend | Full depth consumed at once |
| Stealth options | Obfuscate, price bounds | Price and size distribution | Obfuscate |
| Best for | Large size, patient, average-price focus | Planned entry or exit zones | Urgent size |

You can also mix them. Use Chase TWAP and each lot is worked passively. A Cortex TWAP can execute each lot with Chase or Swarm. And a Scale can pick up the deep end of a move while a TWAP builds the core position.

> **Risk note:** Splitting an order manages execution cost, not market risk. A leveraged position built by TWAP over four hours is still leveraged. Know your liquidation price for the full size before the first lot goes out.

## Frequently Asked Questions

### What is a normal amount of slippage?

It depends on the market and your size. A small order on a deep major pair might see none, while the same order on a thin altcoin can slip by many basis points. Measure it in basis points as the gap between the price you saw and your average fill, and compare that with your per-trade target.

### Is TWAP always better than a single market order?

No. TWAP cuts how much depth you take at any one moment, but you're exposed to price movement for the whole run. If you expect price to move fast in your direction, waiting can cost more than the slippage would have. TWAP works best when your size is large relative to depth and you have time.

### Does Swarm reduce slippage?

Swarm splits a large market order into smaller lots and sends them in parallel, which reduces the slippage of a single block order. The lots go out as fast as possible, though, so the book has little time to refill. For size that can wait, TWAP will usually get you a better average.

### Can I run a TWAP longer than 12 hours?

Not client-side. That TWAP caps at 12 hours and stops if you close the Terminal. Cortex TWAP Execution runs on the server with no upper duration limit, keeps the Obfuscate and price bound options, and lets you check per-lot fills in the Activity panel from any device.

### When should I use Scale instead of TWAP?

Use Scale when there's a price zone you want to buy or sell into and you're fine missing the fill if price never gets there. Use TWAP when you need the full size filled within a time window, whatever the exact price.
