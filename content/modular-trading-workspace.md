---
title: "How to Design a Trading Workspace: Components, Tabs, Layouts and Link Colors"
slug: modular-trading-workspace
category: Workspace
cover: layout
theme: green
short: "Build a Workspace Around Decisions"
level: Intermediate
excerpt: "Lay out your Insilico Terminal screen around what you watch and what you act on, with components, tabs, saved layouts and the Link System."
docs:
  - title: "UI overview"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/ui-overview"
  - title: "Link System"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/workspace/link-system"
  - title: "Workspace"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/workspace"
  - title: "Layouts"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/layouts"
  - title: "Hotkeys"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/workspace/hotkeys"
---
Most trading screens grow by accident. A chart, then an orderbook, then another chart, and a year later you're scanning a wall of panels you no longer read. It works better to lay the screen out around decisions: what tells you to act, and where you act on it. Insilico Terminal gives you free-form components, tabs, saved layouts and a color-coded Link System to do that on purpose. Start with the principles below, then look at two example workspaces, one for scalping and one for swing trading.

## Watch Versus Act

Every panel does one of two jobs. Some inform a decision: charts, orderbook, trades and liquidations, news. Others carry it out: order forms, DOM, positions, orders. Mix the two carelessly and sooner or later you'll place an order on the wrong market.

A few rules come out of that:

1. **Put act panels where your eyes already are.** The order form for the market you're trading belongs next to the chart you're reading, not on the far side of the screen.
2. **Keep context panels quiet.** A higher-timeframe chart or a correlated market is there for a glance.
3. **Never let an act panel be ambiguous.** You should always be able to say which account and symbol a given order form will trade.

Most workspaces fail on the third rule, and that's the job of the Link System.

## Accounts, Symbols and Duplicate Components

You can connect several accounts, trade several symbols, open multiple tabs and add more than one component of the same type. Picture a 15-minute bitcoin chart and orderbook on screen while you scalp an altcoin. That flexibility is what makes a proper workspace possible, and it's also where ambiguity creeps in.

Each component has its own account and symbol menus, which control what it shows and where it creates and edits orders. Account-scoped components like Positions, Orders, Balances and Activity can also show All accounts. Get in the habit of checking a component's symbol and account selectors before you trade from it.

![Instrument picker with search, favourites, exchange filter and a list of symbols with price, 24h % and 24h volume](/learn/assets/figures/ui-symbol-picker.png "The symbol menu: search, star favourites, and sort by price, 24h change or 24h volume.")

## Components: Drag, Resize, Hide

You can drag, resize or hide any element of the UI, and add as many charts, order forms and other components as you like from **Add widget** in the top bar. For workspace design the useful ones are the chart, orderbook, trades, DOM, place order, positions, orders, activity, balances and news.

![Add Widget panel with a search box and components grouped under Place Trades, Market Data and Your Activity](/learn/assets/figures/ui-add-widget.png "Add Widget groups components into Place Trades, Market Data and Your Activity, with search at the top.")

Two tips:

- **Size by importance, not habit.** The panel you act from gets the most room. If you only hold a few positions, the positions table can be short.
- **Add Activity if you run long-running orders.** It shows TWAPs, chases and CLI repeat tasks that would otherwise get buried, and you can cancel them from there.

## The Link System: Color-Code Your Intent

You can give each component a link color from the link icon in its header: Orange, Teal, Blue, Purple or Pink. Components with the same color stay in sync: change the account or symbol on one and the rest of that color follow. Unlinked keeps a panel independent. **Apply to all** sets every other component in the current layout to match the one you clicked it on, which saves time during setup.

![Link Group menu with Unlinked, Orange, Teal, Blue, Purple, Pink and Apply to all](/learn/assets/figures/ui-link-group.png "The Link Group menu: pick a color, Unlinked, or Apply to all.")

Link colors only apply within the current tab. A teal group in one tab has no effect on a teal group in another, so you can reuse one color scheme across all your tabs.

A scheme that scales:

| Color | Role | Typical members |
|---|---|---|
| Teal | Your active trade | Main chart, place order, DOM, orderbook |
| Orange | Second market you trade | Chart and order form |
| Unlinked | Fixed context | BTC higher-timeframe chart, news |

> **Terminal tip:** Hotkeys get their own account and symbol, set from Hotkey configuration (the keyboard icon) in the top bar. We strongly recommend giving your hotkeys a link color as well, so your keyboard trades the group you're looking at.

## Tabs and Saved Layouts

Tabs keep several workspaces open so you can flip between them instantly. Click **+ NEW** next to your tabs to create one. Tabs save automatically, and you can delete any of them except Main, which always stays.

Click **LAYOUTS** next to your tabs for **Default layouts**, **Reset current layout**, **Save current as new layout**, **Manage layouts** and **Import layout**. Any layout you open is added as a new tab. **Manage layouts** opens Settings > Layouts, with Your Layouts, Official Layouts and Community Layouts. From Your Layouts you can save, load and export a layout as a JSON file to keep as a backup or share, and mark it Private or Public. Our default and official layouts are a good starting point.

![Layouts menu with Default layouts, Reset current layout, Save current as new layout, Manage layouts and Import layout](/learn/assets/figures/ui-layouts-menu.png "The Layouts menu: save the current screen as a new layout, manage saved ones, or import a file.")

Export whenever you make a meaningful change. If a browser reset or an experiment goes wrong, you're one import away from a screen you know works.

`ui tab <name>` switches tabs from the CLI, so a tab change can live on a key:

```cli
# bind a key that jumps back to the Main tab
bind global ctrl+m "ui tab Main"
# change chart timeframe from the keyboard
ui chart time_4h
```

## Example: A Scalper's Workspace

Scalpers make lots of small, fast decisions on one or two markets. The screen should keep eye movement short and leave no doubt about which market is live.

- **Tab "Scalp", all teal:** a large tick or low-timeframe chart in the centre, DOM next to it, orderbook and trades and liquidations to the side, place order under the chart. Positions and orders in a thin strip along the bottom.
- **One unlinked context panel:** a small higher-timeframe BTC chart, since most altcoin moves start there.
- **Hotkeys linked teal,** so your keys and your eyes are on the same market.

Stay on one tab while you're actively trading. Switching tabs mid-trade is a distraction you don't need.

## Example: A Swing Trader's Workspace

Swing traders make fewer, slower decisions across more markets and accounts. The screen leans toward overview and planning, and execution happens less often.

- **Tab "Overview":** several unlinked higher-timeframe charts for the markets you follow, plus Balances for holdings across all your exchange accounts.
- **Tab "Execute", one link color per market:** chart, place order and positions for each market you have a plan in, each group in its own color.
- **Tab "Orders":** orders, positions and activity across accounts, for checking resting ladders and long-running orders.

Since link colors stay inside their tab, you can use teal and orange in both "Execute" and "Orders" without one tab moving the other.

> **Risk note:** More accounts and symbols on screen means more chances to trade the wrong one. Check the component's account and symbol selectors before every order. The right trade on the wrong account is still a mistake.

## Frequently Asked Questions

### Do link colors carry across tabs?

No. Link colors only work in the currently selected tab. Same-colored components in other tabs aren't affected, so each tab can have its own scheme.

### How do I back up my workspace?

Click LAYOUTS next to your tabs and open Manage layouts, save your layout and export it. You get a JSON file you can import later on any device or share with other traders.

### What does Apply to all in the link menu do?

It sets every other component in the current layout to match the one you clicked it on. It's a quick way to point a whole tab at one market during setup, before you split components into color groups.
