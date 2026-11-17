---
title: "Position Sizing and Stop Losses: Size From the Stop, Then Make Sure It Fills"
slug: position-sizing-and-stops
category: Risk Management
cover: sizing
theme: white
short: "Size From the Stop, Exit Cleanly"
level: Beginner
step: 3
excerpt: "Size every trade from account risk and stop distance, then pick the stop type, trigger source and exit setup that actually gets you out."
docs:
  - title: "TP/SL and Size Calculator"
    url: "https://docs.insilicoterminal.com/documentation/execution-panel/tp-sl-and-size-calculator"
  - title: "Margin / Leverage Control"
    url: "https://docs.insilicoterminal.com/documentation/execution-panel/margin-leverage-control"
  - title: "Stop Market Order"
    url: "https://docs.insilicoterminal.com/documentation/market/stop-market-order"
  - title: "Stop Limit"
    url: "https://docs.insilicoterminal.com/documentation/limit-tab/stop-limit"
  - title: "Ordering with Stops"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/ordering-with-stops"
  - title: "Stops (CLI)"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/stops"
  - title: "Conditional Orders"
    url: "https://docs.insilicoterminal.com/documentation/cortex/conditional-orders"
---
Most blown accounts we've seen started with a sizing mistake. Someone picks a size that feels right, or picks leverage first and lets size follow, and only works out the loss after the stop gets hit. Flip that order. Decide what you're willing to lose, find the price that proves you wrong, and let those two numbers set the size. Then make sure the stop does its job when price gets there, because a stop that slips or never fills breaks the math. Here's how to do both in Insilico Terminal.

## The Inputs That Decide Your Size

You need three numbers before you touch the order form:

1. **Account value.** What the account is worth now, not last week.
2. **Risk per trade.** The share of the account you'll accept losing if the stop fills. A lot of discretionary traders sit between 0.5% and 2%.
3. **Stop distance.** The gap between entry and the price where the idea is invalid.

The terminal uses the same formula:

`position size = risk / (entry - stop)`

Risk is in dollars. Entry minus stop is your dollar loss per unit of the asset. Divide one by the other and you get units.

## A Worked Example

You've got a $10,000 account and risk 1% per trade, so a full loss here is $100.

You want to buy BTC at $60,000. The structure says you're wrong below $58,800, so that's the stop. Stop distance is $1,200, or 2%.

`size = 100 / (60,000 - 58,800) = 0.0833 BTC`

At $60,000 that's about $5,000 notional, half the account. If the stop fills at $58,800 you lose 0.0833 × $1,200 = $100, which is 1%.

Tighten the stop to $59,400 and size doubles to 0.1667 BTC. Widen it to $57,000 and size drops to 0.0333 BTC. Risk is $100 every time. You move the stop, the size follows, and the loss stays put. Shorts work the same way, just with the stop above entry.

The formula assumes you exit exactly at your stop, and you usually won't. Fees come out on both sides (at 0.05% taker each way, a $5,000 round trip costs about $5) and stops can slip. With a 1% budget, sizing for 0.9% keeps the real loss near 1%.

## Leverage Doesn't Change Your Risk

New perp traders get this wrong more than anything else. Leverage changes how much margin the exchange locks up. Your loss at the stop stays exactly where it was.

Take the BTC trade above: 0.0833 BTC, $5,000 notional, stop $1,200 below entry.

```bars
title: 0.0833 BTC with a $1,200 stop: margin used at each leverage
unit: $
caption: The bar shrinks as leverage rises. The loss if the stop fills stays at $100 every time.
2x: Margin used 2500 | Loss at stop $100
5x: Margin used 1000 | Loss at stop $100
20x: Margin used 250 | Loss at stop $100
```

The loss is size times distance, and neither moved. What leverage does move is your liquidation price. On isolated margin, more leverage means less margin behind the position, so liquidation sits closer to entry. At 50x on this trade the margin is about 2% of notional, and once maintenance margin is counted, liquidation can land above your 2% stop. The exchange closes you before your own stop gets a chance.

So the rule we use: size from the stop, then pick leverage low enough that liquidation is well past it. Use leverage to free up margin, and keep it out of the sizing decision.

You set leverage and margin type in the Margin / Leverage control on the execution panel, and changes only apply after you press **Confirm**. On Bybit, long and short leverage are set separately.

The size slider has the same trap. At 100% it gives you the largest order your balance, leverage and price allow, so raising leverage turns the same 25% into a bigger position and a bigger loss at the same stop. Keep it for "this much of my margin" and do risk somewhere else.

## Let the TP/SL Switch Do the Math

That somewhere else is the TP/SL switch on the place order panel. Turn it on with your entry order and you get:

- **Stop:** an absolute price or a percent distance (switch between Price and Percentage). You can also click the chart to fill it.
- **Target:** the take profit level, where the terminal places a trigger reduce order.
- **Size Calculator:** set Risk as a percentage of your balance or a fixed Max loss, with Total or Avail. as the Balance Basis.

Once entry, stop and risk are in, the size field fills itself, and Estimated P&L shows the gain at target, the loss at stop and the R multiple before you click.

![Limit order with TP/SL in Percentage mode: Stop 1%, Target 2%, Size Calculator with Risk 1% and Max loss 100 USDC, size 0.13589 BTC, Estimated P&L +200 / -100 at 2.0R](/learn/assets/figures/ui-limit-tpsl.png "A 1% stop with a 100 USDC max loss sizes the order to 0.13589 BTC, and the 2% target shows +200 / -100 at 2.0R.")

That's the same formula at work: $100 divided by a 1% stop at 73,584 is about 0.1359 BTC, or roughly $9,999 notional. The target sits twice as far away as the stop, so the payoff is 2R. Use **Total** balance for consistent risk across trades, or **Avail.** if you want sizing to shrink while other positions tie up margin. Click the chart at your invalidation level, check the Loss figure, then look at leverage.

> **Terminal tip:** With a Chase entry, risk sizing uses the Maximum Fill Price you set on the Chase Maximum slider instead of the current quote. **Until Fill/Cancel** and Designer mode both need to be off for this to work. Your size then reflects the worst fill you've agreed to take.

## What a Stop Actually Does

A stop is a dormant order with a trigger price. Until price reaches the trigger, nothing sits in the book. Once it does, the exchange releases a real order:

- **Stop market:** a market order for your size executes at the trigger.
- **Stop limit:** a limit order goes into the book at the limit price you set.

Take profits are the mirror image: a trigger that releases a reduce order at your profit level.

### Stop Market: Certain Exit, Uncertain Price

A stop market takes whatever liquidity is in the book when it triggers. In a calm market that might be one tick past your trigger. In a fast one it can be a lot worse.

Say you're long 2 ETH at $3,000 with a stop market at $2,940. A liquidation cascade eats every bid between $2,940 and $2,925 in a second. Your stop triggers at $2,940, but the next bids are around $2,925. You planned to lose $120 and lose about $150. The order got you out, which is its job, but the book set the price.

![Market Stop form with size, Trigger price, Reduce and Close switches](/learn/assets/figures/ui-stop-market.png "A stop market only needs a size and a Trigger, plus Reduce or Close to keep it an exit.")

Stops slip in thin books, at round numbers and swing lows where everyone's stops cluster and hit the same bids, and on news that moves price faster than anything can be matched. You can't remove that from a stop market, but you can plan around it: keep stops off the obvious clusters, size for a worse fill than the trigger, and don't run big stops in illiquid contracts.

### Stop Limit: Certain Price, Uncertain Exit

A stop limit fixes the worst price you'll take. The catch: price has to reach your trigger and then trade at your limit before you fill. If the market gaps through both, the limit order sits there unfilled while the position keeps bleeding. For a protective stop, that's the worst result you can get.

Put the limit behind the trigger (below it for a sell stop, above it for a buy stop) and the order is marketable the moment it lands, so the gap between trigger and limit becomes your slippage cap. Back to ETH: trigger at $2,940, limit at $2,910. You get filled in the cascade down to $2,925, and you're protected from anything below $2,910. If price gaps under $2,910 first, you're still in the trade.

![Limit Stop form with Trigger and Order Price fields, Reduce and Close, and Buy Stop / Sell Stop buttons](/learn/assets/figures/ui-stop-limit.png "The stop limit adds an Order Price under the Trigger, and the gap between them is your slippage cap.")

> **Risk note:** A stop limit placed for protection can leave you fully exposed in exactly the market you placed it for. If the stop is there to cap a loss, a stop market or a stop limit with a wide offset is usually safer.

Binance Spot has no dedicated market stops, so there we only allow limit stops and imitate a market stop by placing the limit behind the trigger. We can't guarantee that in a wick, so leave a reasonable gap.

## Trigger Price Source: Last, Mark or Index

Both stop types have a **Trigger Price Source** setting. It picks whether the exchange's Last traded price, Mark price or Index price gets checked against your trigger.

- **Last** reacts to real trades on that venue. It's the most literal option, and one thin wick can set it off.
- **Mark** is the exchange's fair price reference, usually smoothed and tied to other venues. Harder to wick, and closer to what drives your liquidation.
- **Index** tracks the spot reference basket and ignores dislocations on a single venue.

Last fires on the wick, which may be a fake move. Mark ignores the wick but fires later in a real move, possibly into a worse book. Either way the order executes on that venue's book.

## Reduce, Close and Scaling Out

Two switches keep your exits from turning into new trades:

- **Reduce** makes the order reduce only. It can shrink or close the position but never open a new one or add to it. The order label on the chart shows an "R". Stop limit Reduce isn't available on Bybit Inverse.
- **Close** marks a stop as close on trigger, so it closes the whole position. On Bybit the label shows "C" with a size equal to your position. Other exchanges show "CLOSE".

Use Close when you want the stop to track position size as you scale in and out, and Reduce with a fixed size for partials. Without either, a take profit that triggers after your stop already filled opens a fresh position the other way.

For the BTC example: take half off at a 2R target ($62,400) with a reduce order, then move the stop on the rest to break even. Worst case on the remainder is now about zero minus fees.

## Conditional Exits With Cortex

A normal stop compares one price with one feed. Cortex, our server-side execution engine on Hyperliquid, Bybit, OKX and Lighter, puts a regular order (market, limit, TWAP or chase) behind up to five conditions that our servers check in real time, no browser needed. Conditions can be Price, Candle Close, Candle Volume or Time, joined with **OR** (first one met fires) or **AND** (all must be true at once). That gets you exits a plain stop can't express:

- **Close-based exit.** A Candle Close trigger only fires when a candle closes past your level, so a wick through it doesn't count. Put an exit behind "4h close below $58,000" and intraday noise won't stop you out, at the cost of a worse exit once the close confirms.
- **Hard floor plus confirmation.** Use OR to pair the candle close with a Price trigger further away. The price level catches a crash that won't wait for the candle.
- **Timed exits.** A Time trigger releases an order, or starts a TWAP, at a set UTC time.

The symbol you watch doesn't have to be the one you trade. A BTC price trigger can release an exit on an altcoin, and Pair Price triggers let you watch a ratio like ETH/BTC on the same exchange even if it doesn't list that pair. Handy when one market leads the move, as long as you remember the trigger and the fill happen on different books. Conditions can also watch another venue: a Hyperliquid price can release an order on Bybit, and the other way round.

> **Terminal tip:** A conditional exit waits on our server until its condition is met. It isn't resting in the exchange's book. If you want both, keep a wide native stop market as a disaster floor and use the conditional order for the planned exit.

## Doing It From the CLI

If you've already done the math, the CLI attaches a stop to the entry in one line. Size can be in the base asset, or in USD with `$`. Stop prices can be absolute or a distance.

```cli
# limit buy 0.0833 BTC at 60000, stop at 58800
buy 0.0833 at 60000 stop 58800
# market buy 10 of the underlying, stop 1% away
buy 10 stop 1%
# limit sell $1000 notional 0.1% above last, stop 50 above entry
sell 1000$ at 0.1% stop +50
```

A USD size like `1000$` sets notional. It only matches the risk you want if you got that notional from your stop.

With a position already open, `stop at <price>` places a stop sized to the position, and the price can be absolute, relative or a percentage. Add `trigger <price>` and it becomes a limit stop, where the trigger has to be an absolute price.

```cli
# market stop sized to the open BTCUSDT position, -1% away
stop btcusdt at -1%
# partial market stop, $500 of size, 1% away
stop 500$ at 1%
# limit stop: trigger at 18500, limit 0.1% away
stop at 0.1% trigger 18500
# hedge mode: stop only the short side of SOLUSDT
stop sell 10 solusdt at -2%
```

## Frequently Asked Questions

### What percentage of my account should I risk per trade?

There's no single right number, though many traders stay between 0.5% and 2%. At 1%, ten losses in a row cost about 10% of the account, which you can come back from. At 5%, the same streak costs around 40%. Pick a number you can live with through a bad month.

### Does higher leverage mean higher risk?

Not if size and stop stay the same. Your loss at the stop is size times stop distance, whatever the leverage. Higher leverage does pull your liquidation price closer, and it makes it easy to open a bigger position than you planned. That's where the danger sits.

### Why is my displayed loss slightly different from my risk setting?

Contracts trade in minimum size increments, so the calculated size gets rounded to a valid amount. On small orders in high-priced assets like BTC, that rounding can push the loss a few dollars off target. Fees and slippage at the stop aren't included either.

### Should I use a stop market or a stop limit for my stop loss?

If the stop is there to cap a loss, stop market is usually the right call because it guarantees the exit. A stop limit can miss the fill entirely when price gaps. If you still want a price cap, set the limit well behind the trigger so the order is marketable when it lands.

### How is a Cortex conditional order different from a stop?

A stop compares one trigger price with one price feed and rests at the exchange. A Cortex conditional order can combine up to five conditions, including candle closes, volume and time, with AND or OR logic. Our servers hold and check it, then release it as a regular order once the conditions are met.
