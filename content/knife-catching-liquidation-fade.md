---
title: "Knife Catching: A Routine for Fading a Liquidation Cascade"
slug: knife-catching-liquidation-fade
category: Strategy
cover: knife
theme: black
short: "A Knife-Catching Routine"
level: Advanced
excerpt: "How to fade the end of a liquidation cascade: the volume signal, the empty book, entries, stops, and when not to try it."
docs:
  - title: "Trades + Liquidations"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/trades-+-liquidations"
  - title: "Aggr"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/aggr"
  - title: "DOM"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/dom"
  - title: "Chase"
    url: "https://docs.insilicoterminal.com/documentation/limit-tab/chase"
  - title: "Scale Side"
    url: "https://docs.insilicoterminal.com/documentation/limit-tab/scale-side"
---
A liquidation cascade is forced selling (or forced buying) that feeds on itself until there's nobody left to force out. When it stops, price usually snaps back, because the move emptied the book on the side it ran into. Fading that snap is one of the most mechanical trades there is, and one of the most accurate when it's done with discipline. It's also how traders blow up, because a knife that's still falling looks exactly like one that's about to stop. Here's a routine for it, the signal to wait for, and how to run it in Insilico Terminal.

## What a Liquidation Cascade Is

Leveraged positions have liquidation prices. When price reaches one, the exchange closes that position with a market order. On a dump, liquidated longs become market sells, those sells push price lower, and lower price trips the next batch of liquidations. Stops sit in the same zones and add to it. The move gets fast, wide and loud.

What matters for the fade is what that leaves behind. Every market sell eats a bid, and the asks above price stay thin because sellers were hitting bids, not resting offers. After a sharp move down the ask side is nearly empty, so once momentum decays, buyers don't need much size to move price back up.

Pumps work the same way, mirrored. Short liquidations become market buys, the asks get eaten, and once the squeeze runs out the bid side is thin.

## The Signal: Big Candle, Low Volume

The basic logic is simple to describe and takes practice to see in real time:

1. A high-volume impulse with the liquidation feed lit up.
2. Then a candle in the opposite direction that's relatively large but prints on **low** volume.

That second candle is the tell. A big move on small volume means price is travelling through an empty book. The cascade has ended, contrarians are piling in on the other side, and they're slipping through levels that didn't have time to refill after the fast move.

### A Worked Example

BTC is trading at 100,000. A wave of selling hits and price drops to 96,800 in about three minutes. On the 1m chart the three red candles print roughly ten times normal volume, and the liquidation feed is a solid column of skulls, mostly long liquidations.

The next 1m candle is green and runs from 96,850 to 97,600. Its volume is about a third of the red candles. On the order book, the ask side from 96,900 up to 97,800 is a fraction of what it was ten minutes earlier.

That green candle covered almost a quarter of the drop with a fraction of the effort. That's the fade setup. Had it come on heavy volume, it would point to real two-way fighting, with no clean read on whether sellers are done.

> **Terminal tip:** Tick charts close after a set number of trades instead of a set amount of time, so they print more candles during a cascade. That gives you a finer view of volume drying up than a 1m chart does in a fast flush.

![Chort resolution menu listing Time resolutions from 1m to 1d and Tick resolutions of 10, 50, 100 and 200 plus Custom](/learn/assets/figures/ui-chort-resolutions.png "Pick a Tick resolution in Chort's menu to get more candles out of a fast cascade.")

## Quick Round vs. Big Cascade

Most liquidation fades are a quick round. Price flushes, you catch the snap, and you're out. The trade is a reaction to an imbalance, and imbalances don't last.

The exception is a genuinely impressive cascade, the kind where the liquidation feed scrolls faster than you can read. Don't step in during those. Wait for the liquidations to finish. Price will consolidate a little, which in practice means it tries to spike against the previous impulse (up, after a dump) as latecomers jump in on the other side. That first mechanical spring right after the liquidations stop gives you a feel for how strong the bounce is going to be. A sharp, effortless spring usually means more room. A weak, grinding one means the book is refilling and the trade is smaller than you hoped.

Reading that spring takes screen time. Watch a lot of them before you size into one.

## Why Bottoms Are Easier Than Tops

Bounce trades, catching the bottom of a flush, are the most profitable version of this and the easiest to detect. Liquidation fades are more reliable for bottom capture than top capture, because price cleans out the downside faster, so reversals are easier to confirm. Dumps tend to be violent and short. Squeezes often grind and keep going longer than feels reasonable.

That doesn't make the long side safe. Longs into a flush come with higher risk and bigger drawdowns, because you're buying while the screen is still red and the next leg can start without warning.

## Setting Up the Terminal

Put these on one link colour so they all follow the same instrument:

- **Two Trades + Liquidations components.** Set a high minimum size in Trades Options (filter icon) on the first, so it only shows whale prints and liquidations (marked with a skull icon). Set the second low for the rhythm of the tape. Turn on Aggregated to combine exchanges, in USD or coin notional.

![Trades + Liquidations component streaming BTC-USDC prints with price, USD size and age, plus V and Δ in the footer](/learn/assets/figures/ui-trades-liquidations.png "Each row shows price, USD size and age, and a skull marks any liquidation in the stream.")
- **Aggr** for trade aggregation, analytics and sound. You can hear a liquidation wave building and, more importantly, hear it stop.
- **Orderbook** with the Pull/Stack meter, which shows liquidity added and removed per side. After a dump, watch the ask side thin out, then watch whether anyone stacks it back up.
- **DOM** for the same read on a ladder, right next to your orders.
- **Chort chart** on 1m or a tick resolution, with volume visible.
- **News feed.** If a cascade starts, check it first. A headline-driven move is the one you don't fade.

![DOM ladder on BTC-USDC with the orderform on top: Lots and Multiplier, +1 to +10 and CLR, MKT. BUY, MKT. SELL, BEST BID, BEST ASK, FLATTEN, REVERSE and the three cancel buttons, above ORDERS, BID, SOLD, PRICE, BOUGHT and ASK columns](/learn/assets/figures/ui-dom.png "Watch the ASK column thin out above price after a dump, and keep FLATTEN and CANCEL ALL within reach.")

## Entries, Exits and Stops

### Before the Flush

The best fills come from orders you placed before anything happened. Use Scale or Scale Side to rest a ladder of bids below price, spaced across the zone where you'd expect a flush to run into. That's your first clip, and it should be small.

![Limit Scale form spreading 20 orders from 73,500 down to 72,800 with the Skew panel showing Size +44% and an average of 72,911](/learn/assets/figures/ui-scale.png "A Scale ladder of 20 bids from 73,500 to 72,800, skewed so more size rests lower in the zone.")

```cli
# rest a $1,000 bid 1% under price
buy 1000$ at -1%
# protective sell stop 1% away
stop sell at 1%
```

### When the Spring Starts

If you're not already filled, use Limit Chase to get a passive fill as price starts lifting. Use market only when you must, when the spring is clearly running and missing it costs more than the taker fee.

### Two-Stage Sizing

Money is at the extremes. Treat normal deviations as noise and save your size for real ones. Size in two stages:

- **First clip:** small, when the fade triggers.
- **Add:** only once price confirms, for example by reclaiming a short moving average on your chart.
- **Never** average down a loser. If the first clip is underwater and price is making new lows with fresh liquidations, the cascade isn't over and your read was wrong.

### Where the Stop Goes

Most newer traders put their stops in the same places, right where the next leg of the cascade cleans them out. The obvious spot is just under the wick extreme. Put your stop where the idea is wrong instead, then size from that distance. In the BTC example, a new low below 96,800 on a fresh burst of long liquidations means selling has restarted, so the stop goes beyond that with some room.

Say you enter at 97,000 with a stop at 96,030. That's a 1% stop. If you're willing to lose $200 on the idea, your total size is $20,000 across both stages. The TP/SL switch in the order form will do this sizing for you: turn on its Size Calculator, enter a Risk % or Max loss against your Total or Avail. balance, and it fills the size from your stop distance and shows the Estimated P&L and R multiple.

### Time Stop

Every second in the trade is risk. On low timeframes you have to be fast, and the longer you stay, the hotter it gets. If the snap doesn't come within a few candles, the empty-book thesis has expired and you're holding a normal position in a volatile market. Take profit into the spring, and get out if it stalls.

> **Terminal tip:** Bind your exits before the session so you're not typing during a flush. A position exit and an order wipe are the two keys that matter most.

```cli
bind global x "close long"
bind global z "nuke orders"
```

## When Not to Fade

Mean reversion works until a big player is feeding one-way flow. It does wonders in ranges and gets destroyed on trend days. Skip the trade when:

- **It's a trend day.** If price has been making lower lows all session and each bounce gets sold, a liquidation flush is just the trend accelerating.
- **Flow is one-way.** If the low-threshold tape keeps printing steady market sells after the liquidations stop, someone is still selling.
- **It's headline-driven.** Check the news feed. A move with a real reason behind it can reprice the asset, and the empty-book snap may never come.
- **The cascade keeps going.** If the liquidation feed pauses and then lights up again at lower prices, you're in a multi-leg move. Wait, or walk away.
- **It's a thin alt.** Low-liquidity alts can drop far beyond any level that looks reasonable, gap through your stop, and give you terrible fills on both sides.

> **Risk note:** Catching knives with leverage can go very wrong, very quickly. A fade that fails rarely fails slowly. Know your loss before you enter, keep the first clip small, and never hold a losing fade hoping the bounce shows up late.

## Pre-Session Checklist

- Both Trades + Liquidations components linked and filtered (high threshold, low threshold).
- Aggr sound on.
- Orderbook and DOM on the same link colour, Pull/Stack meter visible.
- Chort on 1m or tick resolution with volume.
- News feed open. Know what's scheduled today.
- Is this a range day or a trend day? If you can't tell, size down.
- Max loss per fade decided, in dollars.
- Exit hotkeys bound and tested on a small order.
- Bid ladder with Scale / Scale Side ready, or a clear reason you're not using one.

## Frequently Asked Questions

### What is a liquidation fade?

It's a trade against the direction of a liquidation cascade, entered once the forced orders run out. After the cascade there's very little resting size on the side price has to travel back through, so it tends to snap back easily. You're trading that snap.

### How do I know the cascade is over?

Look for a high-volume impulse with heavy liquidations, followed by a relatively large opposite candle on low volume. Confirm it with the liquidation feed going quiet and the order book showing thin size on the side price is moving back into. None of that is certain, which is why the first clip stays small.

### Should I fade pumps the same way?

You can, mirrored. Bottoms are easier, since dumps clean out faster and reversals confirm sooner. Squeezes tend to run further than expected, so be more conservative with tops.

### Why not put my stop just below the wick?

Because that's where most stops already are, and a second leg will take them all out before it turns. Put the stop where a new low would prove the cascade restarted, then size the position from that distance.
