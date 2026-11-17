---
title: "Scalping vs Swing Trading Perps: Two Terminal Setups, From DOM Hotkeys to Cortex Conditionals"
slug: scalping-vs-swing-terminal-setup
category: Strategy
cover: timeframe
theme: white
short: "Scalping vs Swing: Two Setups"
level: Advanced
excerpt: "How scalping and swing trading perps differ on holding time, fees and funding, and how to build an Insilico Terminal layout for each."
docs:
  - title: "DOM"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/dom"
  - title: "Chase"
    url: "https://docs.insilicoterminal.com/documentation/limit-tab/chase"
  - title: "Shortcut / Hotkeys"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/shortcut-hotkeys"
  - title: "Designer"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/chart/designer"
  - title: "Conditional Orders"
    url: "https://docs.insilicoterminal.com/documentation/cortex/conditional-orders"
---
Scalpers and swing traders trade the same perpetual contracts off the same order book, but they're doing different jobs. A scalper holds for seconds or minutes and makes dozens of decisions a session. A swing trader holds for days, makes a handful of decisions a week, and has to live with whatever happens while they're asleep. Fees, funding and screen layout hit each style differently. We'll go through the trade-offs first, then build two Insilico Terminal setups: a DOM-and-hotkeys scalping station and a chart-driven swing workflow with scale entries and Cortex conditionals.

## What Separates the Two Styles

Holding time drives everything else. A scalper might go in and out 20 to 50 times a day, and every one of those is a chance to misclick, oversize or hesitate, so speed and muscle memory pay. A swing trader places a few orders and needs a plan that runs without them babysitting it.

The edge is different too. Scalpers read order flow: who's lifting offers, where size is stacking or pulling. Swing traders read structure, meaning higher-timeframe levels, trend and catalysts. The leaks differ as well. For a scalper it's cost per trade. For a swing trader it's overnight risk: gaps, wicks into stops, and funding piling up while the position sits there.

## Fees and Funding: The Math That Picks Your Style for You

These figures are illustrative. Check your own venue's fee schedule and funding history.

Say you have a $10,000 account and trade $50,000 notional per scalp. At a hypothetical 0.05% taker fee, each side costs $25, so a round trip is $50. Twenty round trips a day comes to $1,000 in fees, 10% of the account, before you've made one correct call. Get maker fills on both sides at a hypothetical 0.02% and the same day costs $400. That gap is why scalpers are obsessive about post-only entries and passive exits.

Now the swing trader. A $20,000 position held 10 days on a venue with 8-hour funding crosses 30 intervals. At an illustrative 0.01% per interval that's 0.3%, or $60, paid or received depending on which side of the market you're on. Fees you pay once. Funding keeps growing with time, and it can flip sign on you.

In Insilico Terminal, the [Market](https://docs.insilicoterminal.com/documentation/application-elements/market) component shows funding and open interest for the current instrument. Make the [Tickers / Instruments](https://docs.insilicoterminal.com/documentation/application-elements/tickers-instruments) component wide enough and it shows funding and OI across instruments in sortable columns.

## Scalper Setup: DOM, Hotkeys, Chase and Click Placement

Build this on a single tab: a DOM, a 1-minute or tick chart, a place order panel and positions. Put them all on the same Link colour so changing the symbol in one carries through to the rest.

### The DOM Is Your Order Entry

The DOM merges the order book with execution. Left-click a bid or ask cell to place a limit at exactly that price. Shift + click places a regular stop. Ctrl + click places a position-linked stop tagged CLOSE (on exchanges that don't support that type, it falls back to a regular stop). Drag orders to move them; click them in the orders column to cancel.

Turn on the DOM orderform for the buttons you'll want under pressure: **FLATTEN** closes all positions and cancels all orders, **REVERSE** reverses the position, and **CANCEL ASK**, **CANCEL ALL** and **CANCEL BID** pull resting orders. **MKT. BUY** and **MKT. SELL** cross the spread, and **BEST BID** and **BEST ASK** rest at the touch. If you want stops to survive a CANCEL ALL, set that in the global DOM settings. Keep an eye on the footer. **S** shows the spread in ticks and goes orange when it's wide, which is usually your cue to stop crossing it.

![DOM ladder on BTC-USDC with the orderform on top: Lots and Multiplier, +1 to +10 and CLR, MKT. BUY, MKT. SELL, BEST BID, BEST ASK, FLATTEN, REVERSE and the three cancel buttons, above ORDERS, BID, SOLD, PRICE, BOUGHT and ASK columns](/learn/assets/figures/ui-dom.png "Lot size, market and touch buttons, and the FLATTEN and cancel controls all sit above the ladder.")

### Hotkeys Through the CLI

All key binding is done in the CLI. Here are a few examples:

```cli
# jump to the CLI input from anywhere
bind global ctrl+space "ui cli focus"
# hit the DOM's market buy button with one key
bind global b "ui dom btn_mkt_buy"
# add 10% of max available to the order form size
bind global shift+right "ui order size +10%"
# one-word passive exit for a long: chase the whole position out, reduce-only
alias tpsell "chase sell 100% reduce"
```

Two ways this goes wrong. Keys don't register while a text box has focus, so press TAB to get out of the CLI first. And hotkeys trade whatever account and symbol you set in Hotkey configuration (the keyboard icon in the top bar). We strongly recommend giving your hotkeys a Link colour so you always know which venue a keypress is going to hit.

![Hotkey configuration with Binds, Variables and Aliases tabs, Global and Symbol scopes, and binds for F7 nuke orders, F8 close long and Shift+F8 close short](/learn/assets/figures/ui-hotkey-binds.png "Every bind shows up here under Global or Symbol, so check your exit keys before the session.")

### Chase for Maker Fills, Click Placement for Speed

**Chase** puts a limit at the best bid or ask and keeps repricing it to follow the quote. Set **Chase To** as your worst acceptable price: 0.5% from a 10,000 entry means a buy won't chase above 10,050. Think of that cap as your slippage budget. Only toggle **Priority** when the fill matters more than the fee, because it chases the opposite side of the book.

[Click Placement](https://docs.insilicoterminal.com/documentation/limit-tab/click-placement) drops a fixed Size Each on the chart with one right click, with auto side picking buy or sell. [Scale Side](https://docs.insilicoterminal.com/documentation/limit-tab/scale-side) spreads several orders close to price on one side, with a Quote Offset for the nearest order, for quick laddered entries.

> **Risk note:** A hotkey bound to a market order fires just as fast on a bad day as on a good one. When you only mean to exit, turn on the header's Reduce-Only mode ([`ui header reduce`](https://docs.insilicoterminal.com/documentation/terminal-cli/ui-control) toggles it from a key), which turns every order into a reduce order. Size your binds in USD or percent so a symbol switch can't turn a small order into a big one.

## Swing Setup: Designer, Scale Entries, TP/SL and Cortex

The swing station is quieter: a 4H or 1D chart, a place order panel, positions and the Activity panel. The DOM is optional.

### Design the Trade on the Chart

Click the Designer icon (pointer) in the top bar, pick an order type in Place Order, then click the chart. You get a preview you can drag into place before hitting Buy or Sell. The chart and order form need to share a Link colour. The Designer handles most order types, Scale and Limit Stop included.

### Scale Into the Zone Instead of Guessing the Tick

Swing levels are zones. Trying to nail the exact tick is how you miss the fill. [Scale](https://docs.insilicoterminal.com/documentation/limit-tab/scale) spreads a total size across 2 or more orders between two prices, with Price and Size Distribution sliders to bunch orders up or weight size toward one end.

![Limit Scale form spreading 20 orders from 73,500 down to 72,800 with the Skew panel showing Size +44% and an average of 72,911](/learn/assets/figures/ui-scale.png "The Skew panel shows how size is weighted across the zone and the average price you'd fill at.")

From the CLI:

```cli
# 10 buy orders from 31250 to 32000, heavier at the low end (icubic, skew 1.0)
scale buy 20000 into 10 from 31250 to 32000 icubic 1.0
# reduce/close market stop on the open btcusdt position, 1% away
stop btcusdt at -1%
```

### Size From the Stop, Not the Leverage Slider

Switch on the [TP/SL switch](https://docs.insilicoterminal.com/documentation/execution-panel/tp-sl-and-size-calculator) on your entry order and turn on its Size Calculator. Enter a stop and target, then a Risk as a percent of your Total or Avail. balance or a Max loss amount, and the terminal sizes the trade with `position size = max loss / |entry - stop|`. On a $10,000 account risking 1%, entry at 50,000 and stop at 48,000, you get $100 / $2,000 = 0.05 BTC. Liquidation can come well before a 100% loss depending on leverage and your other positions, so make sure your liquidation price sits beyond your stop. On [stop orders](https://docs.insilicoterminal.com/documentation/market/stop-market-order), pick the **Trigger Price Source** (Last, Mark or Index) on purpose. A thin last-traded wick can set off a stop that mark price wouldn't have.

### Let Cortex Wait for Confirmation

You can't sit up for every 4H close. **Cortex** holds an order on our servers and only executes it once its trigger conditions are met, browser closed or not. You can attach up to 5 conditions with AND or OR logic. A good swing filter: a 4h Candle Close above a level AND 1h Candle Volume above a threshold.

> **Terminal tip:** Cortex runs on Hyperliquid, Bybit, OKX and Lighter, needs 2FA, and [syncs your API keys](https://docs.insilicoterminal.com/documentation/cortex/setup) to the Cortex backend. It's opt-in. If you don't turn it on, your keys stay in the browser.

![Cortex settings with the enable toggle, setup steps Enable 2FA, Sync API keys, Verify device and Sync accounts, a synced account, and Add a new account for Bybit, Hyperliquid, OKX and Lighter](/learn/assets/figures/ui-settings-cortex.png "Work through the four setup steps in order, then add accounts on Bybit, Hyperliquid, OKX or Lighter.")

Cortex also lifts the 12-hour cap on TWAPs, handy for building or unwinding a swing position over several days. For exits, [Auto TP](https://docs.insilicoterminal.com/documentation/application-elements/header-controls) in the header places multiple scale reduce-only orders whenever a position opens, with the count and percentage range up to you.

## Side-by-Side Comparison

| | Scalper | Swing trader |
|---|---|---|
| Holding time | Seconds to minutes | Days to weeks |
| Decisions per day | Dozens | A few per week |
| Main cost | Fees and spread | Funding and gap risk |
| Primary view | DOM, tick or 1m chart | 4H / 1D chart |
| Entry tool | DOM clicks, Click Placement, Scale Side | Designer + Scale |
| Passive fills | Chase with a Chase To cap | Resting scale orders |
| Exits | Hotkeys, chase reduce, FLATTEN | TP/SL switch, stop orders, Auto TP |
| Automation | CLI binds and aliases | Cortex conditional orders |
| Biggest failure mode | Overtrading, misfired hotkeys | Unwatched stops, funding drag |

## Choosing, or Running Both

Most people lean one way and borrow from the other. A swing trader can still chase into a level to dodge the taker fee, and a scalper can leave a Cortex conditional running for the breakout they don't have the patience to sit through. Give each style its own tab with its own Link colours (they only apply within the current tab), and save each one as a [layout](https://docs.insilicoterminal.com/documentation/application-elements/layouts) you can export as a .json file.

Pick the style your costs allow. If round-trip fees eat a big chunk of your average win, you're scalping for the exchange's benefit. If you can't stomach a position going against you overnight, trade the swing smaller.

## Frequently Asked Questions

### Why use chase instead of a market order for scalping?

Chase tries to fill you at the top of your side of the book, which can mean paying maker instead of taker on every fill. Chase To caps how far it follows price, so slippage stays under your control. The downside: in a fast move you might not get filled at all.

### Do Cortex conditional orders run when my browser is closed?

Yes. Cortex checks conditions and executes on our servers, so tasks keep running if you close the browser, drop your connection or switch devices. It needs 2FA and syncing your API keys to the Cortex backend, and runs on Hyperliquid, Bybit, OKX and Lighter.

### How does funding affect a swing trade?

Longs and shorts exchange funding at regular intervals while the position is open. Over a multi-day hold it can outweigh your entry and exit fees combined, in your favour or against you. Check it in the Market or Tickers component before you plan the hold.

### Can I bind hotkeys to specific exchanges and symbols?

A plain `bind` applies only to the current instrument and exchange; `bind global` applies everywhere. Hotkey configuration (the keyboard icon in the top bar) sets which account and symbol your keys trade, and you can shift-click a component header to assign its ticker.
