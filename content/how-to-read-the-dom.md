---
title: "How to Read the Order Book and Trade From the DOM Ladder"
slug: how-to-read-the-dom
category: Order Flow
cover: dom
theme: black
short: "How to Read the DOM"
level: Intermediate
excerpt: "Read depth, spread and walls without falling for spoofs, then place, move and cancel orders straight from the DOM ladder in Insilico Terminal."
docs:
  - title: "DOM"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/dom"
  - title: "Orderbook"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/orderbook"
  - title: "UI Control"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/ui-control"
  - title: "Click Placement"
    url: "https://docs.insilicoterminal.com/documentation/limit-tab/click-placement"
  - title: "v5.2.4 changelog"
    url: "https://docs.insilicoterminal.com/documentation/changelog/v5.2.4"
---
A chart shows where price has been. The order book shows who's waiting for it, and with how much size. Read depth well and you'll rest orders in better spots, know how much a level can absorb, and see when a move is running into real supply. Read it badly and you'll keep trusting size that disappears the moment you lean on it. Below is how to read a book, where it misleads you, and how to trade straight off the price ladder with the DOM in Insilico Terminal.

## What the Order Book Shows

An order book lists every resting limit order on one instrument, grouped by price. Bids are buyers waiting below the market, asks are sellers waiting above it. The highest bid and lowest ask make up the top of book, or the touch. Everything behind them is depth.

Start with these numbers:

- **Spread:** the gap between best bid and best ask. Tight means cheap to get in and out. If it suddenly widens, liquidity providers are stepping back, usually because they expect volatility.
- **Size at the touch:** how much you can trade at the best price before you move it.
- **Cumulative depth:** total size from the touch out to a given price. That's what your market order will eat through.

In Insilico Terminal's Orderbook component, the dimmed background bars show both the volume at each row and the cumulative volume on each side. Grouping combines rows (a grouping of 10 steps prices by 10), so big levels stand out on instruments with tiny tick sizes. The abbreviate button shortens sizes (1.24M instead of 1,240,000) and the $ button converts them to USD on supported instruments, which lets you read size in dollars instead of contracts.

![Orderbook component on BTC-USDC with red ask rows above the mid price, green bid rows below, and depth bars behind each size](/learn/assets/figures/ui-orderbook.png "Asks sit above the mid price and bids below it, with the shaded bars showing how size stacks up on each side.")

## Reading Depth: Walls, Gaps and Imbalance

### Walls

A wall is an unusually large order at one price. A bid wall can act as a floor, since sellers have to chew through it before price goes lower, and an ask wall can cap a rally. Stops and other resting orders tend to cluster around walls too, which is why price often reacts near one even when it never gets hit.

### Gaps

Gaps are thin stretches with little resting size. Price moves fast through them because nothing's there to absorb market orders, and a market order sent into a gap slips more than the touch size would suggest.

### Imbalance

Imbalance is visible bid size against ask size. A book stacked on one side tells you where passive interest sits, not where price is headed. Aggressive traders often push price straight into the heavy side to fill against it.

The Orderbook's top-right meter shows **IMB** for the normalised ratio of visible bids to asks, **UPD** for how often the book is updating, and **WGT** for the volume-weighted change of bids versus asks. When the update rate climbs while price sits flat, there's heavy quoting going on, and that often comes just before a move.

## The Spoofing Caveat

Plenty of orders in the book have no intention of trading. Spoofing is placing large orders to fake supply or demand, then pulling them before they fill. The classic sign is a wall that keeps stepping away from price, or vanishes as price gets close.

Treat visible size as a claim until it proves otherwise. A few habits help:

- See whether a wall survives contact. Size that gets hit and holds is real. Size that's cancelled one tick away was never there for you.
- Watch adds and removes, not just the snapshot. The Orderbook's **Pull/Stack Meter** plots adds in the upper half and removes in the lower half for each side over time, so a wall that's built and pulled over and over shows up there.
- Confirm with trades. Executed volume at a level, shown in the DOM's volume profiles, tells you where real business got done.

> **Risk note:** Never size a trade on the assumption that a wall will hold. Put your stop where your thesis is wrong, not one tick behind someone else's order.

## The DOM: Depth and Execution in One Ladder

The DOM (Depth of Market) puts order book data and order entry on one vertical price ladder. In Insilico Terminal it's built from configurable columns:

- **Orders column:** your active orders, green for bids and red for asks. Darker shading means one order at that price, lighter means several. Stop orders get triangular markers.
- **Bid and ask columns:** real-time depth at each price.
- **Price column:** price levels at your grouping setting, with last traded price highlighted, your position entry marked, and optional momentum tails.
- **Volume profiles:** bought and sold volume, a delta profile and a volume profile per price level. They show where effort went in and where imbalances formed. Reset them with the **Clear Profiles** button or on the interval you set in component settings.

The footer gives you quick context: total volume (V), cumulative volume delta (Δ), high and low (H, L), range (R), and the spread in ticks (S), which turns orange when the spread is wide.

## Trading From the Ladder

The ladder is at its fastest when you already know where you want to be. Mouse controls:

- **Left-click** on the bid or ask column places a limit order at that exact price.
- **Shift + click** places a regular stop order.
- **Ctrl + click** places a position-linked stop, tagged CLOSE. If the exchange doesn't support that type, you get a regular stop.
- **Click** in the orders column cancels an order or a group at that price.
- **Drag and drop** an order to move it to a new price.
- **Right-click** the price column to recenter, and scroll levels with the mouse wheel.

The DOM orderform, shown or hidden with **Toggle order form** next to the selectors, holds size and order controls: MKT. BUY and MKT. SELL, BEST BID and BEST ASK placement, POST and REDUCE toggles, FLATTEN (close all positions and cancel all orders), REVERSE (reverse the position), and CANCEL ASK, CANCEL ALL and CANCEL BID. Size comes from a slider, or you can turn on Big Boy Lot Size in the DOM settings, where you enter Lots with a Multiplier per lot and the +1, +2, +5 and +10 buttons add lots to the current size (CLR clears it).

![DOM ladder on BTC-USDC with the orderform on top: Lots and Multiplier, +1 to +10 and CLR, MKT. BUY, MKT. SELL, BEST BID, BEST ASK, FLATTEN, REVERSE and the three cancel buttons, above ORDERS, BID, SOLD, PRICE, BOUGHT and ASK columns](/learn/assets/figures/ui-dom.png "The orderform sits above the ladder, and the footer tracks V, Δ, H, L and R for the session.")

> **Terminal tip:** A click on the bid column above the best ask isn't a passive bid. Since v5.2.4 the DOM accepts limit orders at crossed-spread prices, so that click fills immediately against the asks and pays taker. If you only want to rest, turn on Post in the DOM orderform.

FLATTEN and REVERSE do the most damage when hit by accident. FLATTEN closes every position and cancels every order in one click. REVERSE flips you to the other side, which amounts to a brand-new trade at market risk. The global DOM settings can keep your stop orders when you use CANCEL ALL; turn that on if you cancel entries a lot. Know exactly what each button does before you trade size with it.

## Binding the DOM to Hotkeys

Nearly every DOM action can go on a key through the CLI's UI Control commands, in the form `ui <component> <action>`.

```cli
# fire the DOM market buy button
ui dom btn_mkt_buy
# put it on the b key
bind global b "ui dom btn_mkt_buy"
# freeze the ladder, or go back to following the latest price
ui dom btn_freeze
ui dom btn_follow
# reset the volume profiles
ui dom btn_clear_profiles
```

Freeze is handy when price is ripping and you want to place an order without the ladder scrolling under your cursor. Follow snaps it back to live price.

If you'd rather work off the chart, Click Placement in the Place Order form does a similar job there. Set a Size Each, and every right click on the chart places an order of that size. Auto side picks buy or sell from where you click, or you can lock it to one side.

## Frequently Asked Questions

### What is the difference between the Orderbook and the DOM?

Both show resting bids and asks. The Orderbook is a depth view with reading tools like the Pull/Stack Meter and the IMB, UPD and WGT meters. The DOM puts depth on a price ladder next to your orders, volume profiles and click-to-trade controls, so you read and execute in the same place.

### How do I spot spoofing?

Watch what large orders do as price gets close. Size that's pulled or moved just before it would trade is a warning sign, and repeated adds and removes at one level show up on the Pull/Stack Meter. Confirm any level with executed volume, not resting size alone.

### Does clicking the DOM place maker orders?

A click places a limit order at the price you clicked. On your side of the spread, it rests as a maker order. Across the spread, it fills immediately as a taker. Turn on Post when you want to be sure it only rests.

### What does the orange spread in the DOM footer mean?

The S value in the footer is the current spread in ticks, and it turns orange when the spread is wide. Market orders get more expensive then, and wide spreads often come before or during volatility, so take it as a cue to slow down.

### Can I cancel orders without the mouse?

Yes. The DOM orderform has CANCEL ASK, CANCEL BID and CANCEL ALL buttons, and you can bind DOM actions to hotkeys through the CLI's UI Control commands. The DOM settings menu lists which actions can be bound.
