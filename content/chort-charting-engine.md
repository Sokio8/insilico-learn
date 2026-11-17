---
title: "Chort: Charting and Order Entry in One Place"
slug: chort-charting-engine
category: Charting
cover: chort
theme: black
short: "Meet Chort, Now in Insilico Terminal"
level: Beginner
excerpt: "Chort is now integrated into Insilico Terminal. Read price, see your orders and fills, and place or move trades without leaving your layout."
docs:
  - title: "Chart"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/chart"
  - title: "Designer"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/chart/designer"
  - title: "Scale"
    url: "https://docs.insilicoterminal.com/documentation/limit-tab/scale"
  - title: "Link System"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/workspace/link-system"
---
Most traders chart in one window and trade in another, then spend the day copying prices between them. Chort fixes that. It's a charting engine we've integrated into Insilico Terminal, so the chart you read is the same surface you trade from. Your orders, fills, positions and liquidation price sit on the candles, sized the way your order forms size them, and a click on the chart can set a price or place an order. Here's how to add Chort to your layout, read what it shows you, and trade from it with fewer clicks.

## What Chort Is and Why We Integrated It

Chort is a standalone charting engine made by a separate team. We've integrated it into Insilico Terminal through its embedded SDK, so it runs inside your workspace instead of next to it. A chart bolted onto a trading app never really knows your settings or your orders. Integrated this way, Chort does, because it lives in the same workspace you execute from. It's labelled beta in the terminal while the integration keeps improving.

Chort is replacing TradingView in the terminal. While we make that move, the TradingView chart stays available as read-only, so any order work on the chart happens in Chort.

Chort brings its own chart tools too. The **Indicators** menu sits at the top of the chart, and the toolbar down the left side holds drawing tools, from trend lines, channels and pitchforks to Fibonacci retracements, volume profile and long and short position tools.

![Chort in Insilico Terminal showing a BTC/USDC 5-minute Hyperliquid chart with the Indicators menu at the top and drawing tools on the left](/learn/assets/figures/ui-chort.png "Chort on a BTC/USDC 5m chart: resolution, symbol and account menus up top, Indicators below them, drawing tools down the left side.")

If you'd rather see it than read about it, [watch our 90-second explainer](https://www.youtube.com/watch?v=bY3IkrlotL4).

## Adding Chort to Your Layout and Linking It

Chort is a component, the same as the order forms, positions table or DOM. Add it to your layout and place it wherever it makes sense, usually next to the order form you use most.

Then link it. Give the chart and the order form the same link colour and they'll stay on the same symbol. A price you click on a BTC chart is no use in an order form that's still set to SOL.

## Reading Your Orders, Fills and Positions on the Chart

Chort draws your trading activity right on the price axis:

- **Order flags** mark each of your open orders at its price.
- **Fill markers** show where your orders actually filled, so you can see your entries and exits against the candles that produced them.
- **Positions and drafts** show at their prices too.
- **Liquidation price** appears as a line when the "show liquidation price" setting is on.

Sizes on the chart come from the actual order quantity and follow your Con./USD notional size setting. If your order form shows size in USD, the chart does as well, and the numbers match. You won't have to convert contracts in your head halfway through a trade.

Chort's toggles stay in sync with the app's settings. Turn off "show liquidation price" and the line disappears straight away. Turn it back on and it's there again, no reload needed.

Privacy mode carries over too. With it on, Chort masks order and position amounts and PnL, which is handy when you're screen sharing or streaming and would rather keep your size to yourself.

## Placing and Moving Orders From the Chart

There are a few ways to put an order on the book without typing a price.

**Right-click to place.** Right-click anywhere on Chort and pick **Place order @ price**. That places a limit order at the price you clicked. The same menu also has **Copy price**, drawing shortcuts, Remove all drawings, Reset chart view and Settings.

![Chort right-click menu with drawing shortcuts, Copy price, Place order @ 73721, Remove all drawings, Reset chart view and Settings](/learn/assets/figures/ui-chort-context-menu.png "Right-click on the chart: Place order @ 73721 sits right under Copy price.")

**Click to fill a price.** Select a price input in an order form, then click on Chort. The clicked price drops into that input. This works on price-pick dropdowns like Quick Close as well, so you can pick a close price straight off a level you're looking at.

**Drag to amend.** Grab a regular order on the chart and drag it to a new price. The order is amended at the price where you let go.

Protected and algo orders work differently. Chase, Stalk, TWAP and Scale orders can't be dragged on the chart, so you can't move a running algo by accident while you're trying to scroll or pan.

> **Risk note:** Dragging works on either side of the market. Drag a buy above the current price without Post Only and it crosses the spread and fills right away as a taker, paying taker fees. If you only want a resting order, turn on Post Only before you place it.

**Design it first.** The Designer is for when you want to see the order before you commit. Click the Designer icon (pointer) in the top bar, pick an order type in Place Order, and click the chart. A preview order appears at that price. Drag it until it sits where you want, then hit **Buy** or **Sell**. Nothing goes to the exchange until you press one of those.

## Scale Orders and the AVG Line

Scale and Scale Side orders spread one order across a ladder of prices. On Chort they also draw a scale average line, marked AVG, at the weighted average price of the whole ladder. You see where the ladder averages before you send it and while it fills.

Here's why that line is worth looking at. Say you build a 10-order buy ladder from 60,000 down to 58,200, one order every 200, with size growing toward the bottom: 0.01 BTC at 60,000, 0.02 at 59,800, and so on up to 0.10 at 58,200. That's 0.55 BTC in total.

The midpoint of that range is 59,100. If every order were the same size, that's where you'd average. Because the bottom orders are much bigger, the weighted average is 58,800, a full 300 lower. The AVG line shows you 58,800 on the chart, which is the number your stop and target should be planned around.

It also keeps you honest if only part of the ladder fills. If price taps 59,400 and bounces, you've only got the top four orders, the smallest ones, and your real average is near the top.

> **Terminal tip:** Build the ladder, then compare the AVG line with your stop before you send it. If the distance between them makes the risk too big for your account, change the range or the size skew, not the stop.

## Time and Tick Resolutions

Chort supports two kinds of candles. Time resolutions close a candle after a set period, like 1 minute or 1 hour. Tick resolutions close a candle after a set number of trades, however long that takes.

![Chort resolution menu with Time options from 1m to 1d and Tick options 10, 50, 100, 200 and Custom](/learn/assets/figures/ui-chort-resolutions.png "Both kinds live in the resolution menu: Time from 1m to 1d on the left, Tick 10 to 200 or Custom on the right.")

Tick charts help when activity is uneven. In a quiet stretch, a 1-minute chart prints flat candles that say very little. In a news spike, one 1-minute candle hides a dozen swings. A tick chart prints fewer candles when little is trading and more when a lot is, so each candle carries a similar amount of activity and fast moves are easier to read.

Tick data isn't available on every venue at every moment. If a venue can't serve tick data, the chart falls back to a time resolution, so if the candles look different from what you expect, check which resolution you're actually on.

## A Simple Setup Routine

1. Add Chort to your layout next to your main order form.
2. Give the chart and the order form the same link colour.
3. Set your Con./USD notional size preference, so chart sizes match how you think about size.
4. Turn on "show liquidation price" if you trade with leverage.
5. Pick a time resolution for context, and try a tick resolution for entries on fast markets.
6. Practise with the Designer and a small size before you drag real orders around.

## Frequently Asked Questions

### Is Chort replacing TradingView?

Yes. Chort is replacing TradingView in the terminal. While we make the move, the TradingView chart is read-only, so placing and moving orders from a chart happens in Chort.

### Can I place orders from Chort?

Yes. Right-click and pick Place order @ price for a limit order at that price, click the chart to fill a selected price input in an order form, or use the Designer to preview an order on the chart before you send it with Buy or Sell.

### Why doesn't my scale order move when I drag it?

Scale orders are protected on the chart, along with Chase, Stalk and TWAP orders. They can't be dragged, so a running algo doesn't get amended by a stray click. Regular orders can be dragged to a new price.

### Why do the sizes on the chart match my order form?

Chort sizes orders, positions and drafts from the actual order quantity and follows your Con./USD notional size setting. Whatever unit you see in the order form is the unit you see on the chart.

### Will privacy mode hide my size on the chart?

Yes. With privacy mode on, Chort masks order and position amounts and PnL.
