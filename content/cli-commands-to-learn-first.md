---
title: "Trading CLI Commands to Learn First: Orders, Stops, Cancels, Bumps and Chases"
slug: cli-commands-to-learn-first
category: Terminal CLI
cover: cli
theme: black
short: "The First Ten CLI Commands"
level: Beginner
step: 4
excerpt: "The Insilico CLI commands to memorise first, from entries and stops to cancels, bumps and chases, and why typing beats clicking in a fast market."
docs:
  - title: "Terminal CLI Overview"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/overview"
  - title: "Simple Ordering"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/simple-ordering"
  - title: "Cancel Orders"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/cancel-orders"
  - title: "Bump Orders"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/bump-orders"
  - title: "Chase Orders"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/chase-orders"
---
When price moves fast, the slowest part of your execution is usually you. You hunt for the size field, clear it, type, pick an order type, double-check the side and click. The command line turns that into one line you type and send. Insilico Terminal's CLI sits next to the graphical order forms and handles ordering, stops, cancels, closes, bumps, chases and scales. You don't need all of it on day one. About ten commands carry most of a trading day, and they're laid out here in the order you'll reach for them.

## Why a Command Line Beats Clicking Under Pressure

Clicking works when you have time to look. It falls apart when a level breaks, a liquidation cascade kicks off or a headline hits, because every field you have to find is one more chance to fat-finger the size or the side.

Commands are explicit. `sell 0.5 at 64000` puts side, size and price on one line, and you read it once before you hit Enter. They're also repeatable: once a command lives in your head or on a key, you send the same thing every time instead of rebuilding it from widgets.

Don't throw the UI away, though. Not every Terminal feature is in the CLI yet. Use it as the fast lane for things you already understand, and stick with the order forms for anything you're doing for the first time.

![CLI panel showing help output for balance, bind help, bind list, alias list, print all and clear, with buy 100$ at -1% typed in the input](/learn/assets/figures/ui-cli.png "The CLI panel: help output above, a limit buy typed and waiting for Enter at the bottom.")

## Read Numbers the Way the CLI Reads Them

Learn how the CLI reads numbers before you learn any command. Most first-week mistakes come from this, not from syntax. The CLI accepts four formats for sizes and prices:

| Type | Example | Meaning |
|---|---|---|
| Absolute | `22500`, `123.5` | A plain number: a price, or a size in the underlying |
| Relative | `+100`, `-50` | Distance from the last price |
| Percent | `5%`, `-1.1%` | Percentage distance for prices; share of available balance for sizes |
| Currency (USD) | `5000$`, `100$` | A USD value |

Absolute size is the one that bites. `buy 100` buys 100 of the underlying asset, not 100 dollars. On a cheap coin that's nothing. On BTC it's a position you almost certainly didn't want. Until the habit sticks, write your sizes in USD with `$`.

> **Risk note:** A percentage size such as `buy 100%` uses your available balance. Add high leverage and most of your account can end up one move from liquidation. Only use percentage sizes when you mean to.

## Commands 1 to 6: Get Oriented, Then Enter

### Orientation: `switch`, `bal`, `max`, `lev`

Open every session by checking where you are and what you can do. Typing an instrument name on its own switches to it. `bal` shows total and available balance, `max` gives the largest order your balance and margin allow at the current price, and `lev` shows or changes leverage.

```cli
# type an instrument name to switch to it
ethusdt
# switch to a spot market
switch btcusdt:spot
# total and available balance
bal
# biggest order you can place right now
max
# check leverage, then change it
lev
lev 50
```

If you're unsure about a size, run `max` first. It costs nothing, and if the number surprises you, your leverage or balance isn't what you thought.

### Entries: Market, Limit and Best

Three forms cover most entries. Bare `buy` or `sell` sends a market order. Add `at <price>` and it's a limit. Add `best` and it goes to the best price in the book, joining the queue rather than crossing the spread.

```cli
# market buy 1000 USD worth
buy 1000$
# market sell 0.1 of the underlying
sell 0.1
# limit buy 1000 USD worth, 1% under last price
buy 1000$ at -1%
# limit sell 0.5 at a fixed price
sell 0.5 at 64000
# 1000 USD at the best quote in the book
buy 1000$ best
```

We use relative and percent prices when reacting to the tape, and absolute prices for levels marked in advance. Mix them freely. A ladder you plan in the morning might be absolute, while fading a spike is easier as `at +0.5%`.

## Commands 7 to 10: Protect the Position, Then Get Out

### Stops and Reduce

Every position needs an exit plan, and the CLI lets you attach a stop at entry or add one later. `stop at <price>` places a market stop sized to your open position automatically. Tack `reduce` onto a market, limit, best, chase or scale order and it becomes reduce-only: it can shrink a position but can't open or flip one.

```cli
# market buy 10 with a stop 1% away
buy 10 stop 1%
# stop on the open position, 1% from last price
stop at -1%
# stop only part of the position
stop 500$ at 1%
# reduce-only take profit 0.5% above
sell 50% at +0.5% reduce
```

Reduce-only is about the cheapest insurance you can buy. Leave it off a take-profit and, if your position already closed some other way, that order can fill and open a fresh short.

### Cancel and Close

You should be able to get out faster than you got in. `cancel` removes orders and `close` flattens positions. Both take selectors, so you can pick off exactly what you want instead of wiping everything.

```cli
# cancel every order on the current instrument
cancel
# cancel just your bids
cancel buys
# cancel the 5 most recent orders
cancel last 5
# cancel all stops
cancel stops
# fully close the focused position
close
# close a third of it
close 33%
# close a position on another instrument
close ethusdt
```

For real emergencies there's `nuke orders` (or `nuke ord`) and `nuke positions` (or `nuke pos`), which hit everything. Know where they are, and don't put them on a key you could press by accident.

## Bump: Move a Group of Orders at Once

Resting orders rarely stay well placed for long. `bump` shifts a group of them by an absolute or percentage amount, and selectors let you target buys or sells, or the top or bottom N orders by price.

```cli
# shift every order on the instrument down 100
bump btcusdt -100
# shift all xrpusdt sells up 0.1
bump sells xrpusdt +0.1
# shift the top 5 orders by price up 10%
bump top 5 +10%
# shift the bottom 10 sells down 1
bump sells bottom 10 -1
```

Two details change how you'll use it. A percentage bump takes the distance from last price to your closest order and applies that to every order, so it isn't a flat percentage of price. Use absolute amounts if you want moves you can predict. Also, every order is amended one at a time, so bumping a big ladder several times a second can run into exchange rate limits and failed amends. Bump doesn't touch stops either; check those separately.

## Chase and Scale: The First Advanced Orders

Chase places a limit order and keeps repricing it with the market until it fills or you cancel. You get maker-style fills without babysitting. Scale splits one size into many limit orders across a price range.

```cli
# chase a 5000 USD buy until filled or cancelled
chase buy 5000$
# chase, but give up past 0.1%
chase buy 100 to 0.1%
# chase out of a whole long, reduce-only
chase sell 100% reduce
# end the chase, leave the order resting
chase cancel keep
# 1000 USD buy split into 10 orders, 0.25% to 1% below
scale buy 1000$ into 10 from -0.25% to -1%
```

Both only work on the instrument you're viewing, so switch first. We'd put a `to` limit on every chase by default. Without one, a chase in a fast market follows price as far as it runs, which is the opposite of a disciplined entry.

> **Terminal tip:** Constants like `$size` and `$entry` read from your open position. `sell $size at $entry` puts an order for your full size at your average entry, and you never type either number.

## A Five-Minute Practice Routine

Pick a liquid instrument and the smallest size the exchange allows. Run `bal`, a `best` entry, a `stop at`, a `bump` on a resting order, `cancel last 1`, then `close`. After each line, look at the orders and positions panels so you see exactly what changed. Do it until you can type the whole sequence without checking anything. Once you can, the CLI is faster than your mouse.

## Frequently Asked Questions

### Does `buy 100` mean 100 dollars?

No. A bare number is a size in the underlying asset, so `buy 100` buys 100 units. Write `buy 100$` for a USD amount or `buy 10%` for a share of available balance. It's the most common first-day mistake, so stick to `$` sizes until it's second nature.

### Do CLI commands work on any instrument?

Most ordering commands act on the focused instrument, and plenty accept an explicit symbol, such as `cancel bottom 10 btcusdt` or `close ethusdt`. Chase and scale only work on the instrument you're viewing, so type its name to switch first.

### Why did some of my bumped orders fail?

Bump amends each order individually. Bump a lot of orders quickly and the exchange may rate-limit you, so some amends fail. Bump less often, target fewer orders with `top` or `bottom`, or cancel and re-place the ladder.

### Is every Terminal feature available in the CLI?

Not yet. Not every feature is supported in the CLI, though the ones that are often go further than the graphical UI. Check the CLI section of our docs for an order type before you rely on it.

### How do I stop a chase without losing my place in the book?

Use `chase cancel keep`. It stops the repricing but leaves the order resting where it is. Plain `chase cancel` pulls the order too.
