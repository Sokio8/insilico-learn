---
title: "What Is a Trading Terminal? Exchange UI vs an Execution Layer Over Your API Keys"
slug: what-is-a-trading-terminal
category: Terminal Basics
cover: terminal
theme: green
short: "What a Trading Terminal Is"
level: Beginner
step: 1
excerpt: "A trading terminal connects to your exchanges with an API key or browser wallet. What it adds, what it never touches, and where Insilico fits."
docs:
  - title: "Insilico Terminal"
    url: "https://docs.insilicoterminal.com/documentation"
  - title: "Frequently Asked Questions"
    url: "https://docs.insilicoterminal.com/documentation/welcome/frequently-asked-questions"
  - title: "Security"
    url: "https://docs.insilicoterminal.com/documentation/welcome/security"
  - title: "Server-Side Execution"
    url: "https://docs.insilicoterminal.com/documentation/cortex/server-side-execution"
  - title: "General Commands"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/general-commands"
---
Every exchange ships its own trading screen, designed around that one venue: one account, one market at a time, and the order types that exchange offers. A trading terminal sits on a different layer. It connects to your exchange accounts with an API key, or with a browser wallet extension on on-chain venues like Hyperliquid, and gives you one place to see positions, place orders and run execution logic across venues. Your money never moves into the terminal. Below is what that layer does, what it can't do, and where it helps most.

## What an Exchange Interface Covers

Exchange interfaces are designed around one venue and a broad range of users, so they cover the common workflow well. Some needs fall outside that, mostly for traders who work across several accounts or trade often:

- **One venue per interface.** With accounts on two exchanges, you switch between two logins and two layouts, and order types may be named differently on each.
- **Order types vary.** Limit, market and stop are standard. Algorithms that split size over time or follow the best bid aren't offered everywhere.
- **Form-based input.** Orders are entered through a form with the mouse. Some traders prefer keyboard shortcuts or a command line for speed.
- **Set layouts.** Each exchange decides which components appear and how much space they get.

## How a Terminal Works

A trading terminal is software that talks to the exchange for you. On a centralized exchange it connects with an API key you create there. On on-chain venues like Hyperliquid it connects through a browser wallet extension, such as MetaMask or Rabby, or an API wallet you approve from it. The exchange still holds your funds, matches your orders and calculates your margin. The terminal reads balances and positions, sends orders, and puts its own interface and logic on top.

![Insilico Terminal workspace with Place Order, Chort, Orderbook, Trades, Market, Orders and CLI components](/learn/assets/figures/ui-workspace-full.png "One workspace: order entry on the left, chart in the middle, book and trade prints on the right, positions and CLI below.")

It helps to think of it in layers:

| Layer | Who owns it | What it does |
|---|---|---|
| Custody and matching | The exchange | Holds collateral, runs the order book, liquidates |
| Access | Your API key or wallet | Grants specific permissions, such as trading but not withdrawing |
| Execution and interface | The terminal | Layouts, order types, CLI, multi-account view |

You control the middle one. The permissions on your API key, or what your connected wallet is approved to sign, decide what any terminal, Insilico or anyone else, can do with your account.

## What a Terminal Gives You

### All Your Accounts in One Interface

Aggregation is the main reason people switch. Insilico Terminal brings all of your accounts into a single interface, so you can act on a move at the right venue without hopping between sites. We currently support:

- **Futures/derivatives:** Binance (including Multi-Assets Mode), Bybit (including Unified Trading Accounts), OKX, Bitget, Coinbase, BloFin, Kraken, Kalshi Perps, Crypto.com
- **Spot:** Binance, Bybit, Coinbase, Kraken
- **DEX:** Hyperliquid (perps, spot, HIP-3 markets and HIP-4 outcome markets), Lighter, Extended, Apex, Nado, Robinhood Chain Lighter, Ondo Perps

Each venue has a walkthrough in [our API key setup guides](https://docs.insilicoterminal.com/documentation/setup/creating-an-api-key).

![Add an account picker listing supported venues with API and WALLET badges](/learn/assets/figures/ui-add-account.png "The badge on each venue tells you whether it connects with an API key or a wallet.")

### Advanced Order Types

A terminal can run execution logic the exchange doesn't offer natively. Our [place order panel](https://docs.insilicoterminal.com/documentation/execution-panel/place-order-overview) has chase, scale, swarm, TWAP and Chase TWAP next to plain limit, market and stop. A chase keeps a passive order near the top of the book so you pay less spread. A TWAP spreads a large order over time so you push the price less.

![Place Order type menu with Limit and Market order types](/learn/assets/figures/ui-order-types.png "Limit types on the left, market types on the right, all from the same Place Order panel.")

Chase TWAP combines the two: each TWAP lot is worked as a chase order instead of a market order, so you get the time-splitting of a TWAP with the passive fills of a chase. If a lot's chase doesn't fill within its chase duration, the rest goes to market or carries into the next lot, depending on the Fallback you pick. In the CLI, the default timeout is 50% of the interval and the default fallback is market.

```cli
# buy 1 BTC in 60 chased lots over 60 minutes
twap chase buy 1 btcusdt into 60 over 60
```

### A Command Line

Insilico Terminal pairs the point-and-click interface with a CLI. The full syntax for the commands below is in our [General Commands](https://docs.insilicoterminal.com/documentation/terminal-cli/general-commands) and [Simple Ordering](https://docs.insilicoterminal.com/documentation/terminal-cli/simple-ordering) pages. Once you know the syntax, typing beats filling in forms, and a command spells out size and side so there's less room for ambiguity.

```cli
# list connected accounts, then switch to account 3
account list
account 3
# show the largest order size your balance and margin allow
max
# limit buy 1000 USD worth, 1% below last price
buy 1000$ at -1%
# cancel every open order on every instrument
nuke orders
```

### Layouts You Control

You can drag, resize or hide every component in the Insilico UI (see our [UI overview](https://docs.insilicoterminal.com/documentation/application-elements/ui-overview)). You can run several tabs and several copies of the same component, say a 15-minute bitcoin chart and order book next to the altcoin you're scalping.

![Add Widget panel listing components grouped into Place Trades, Market Data and Your Activity](/learn/assets/figures/ui-add-widget.png "Add any component to your layout from the Add Widget panel, as many copies as you need.")

## What a Terminal Doesn't Do

It doesn't hold your funds. Custody stays with the exchange, so if the exchange halts withdrawals, a terminal can't get your money out. We advise keeping only what you need for trading on an exchange, and not keeping everything on one venue.

It doesn't remove exchange risk either. Liquidation engines, mark price, funding and auto-deleveraging follow the exchange's rules. The terminal shows you the numbers and leaves them as they are.

It won't make you profitable on its own. Better execution trims slippage and mistakes, but your edge still has to come from your trading.

And client-side logic needs the client. Algorithms running in your browser stop when the browser does: standard Terminal orders need the browser open for the whole execution. Our [Cortex](https://docs.insilicoterminal.com/documentation/cortex/overview) engine moves execution to our servers, so orders keep going after you close the tab. Cortex runs on Hyperliquid, Bybit, OKX and Lighter.

> **Risk note:** A terminal makes it easy to place large orders fast, and that includes the wrong ones. Insilico Terminal has a fat-finger prevention setting that blocks entries above a size you choose. Turn it on before you need it.

## How Insilico Terminal Fits

Insilico Terminal runs in the browser and combines a visual interface, a CLI and advanced order types. A few things to know before you sign up:

- **Free to use.** You pay your exchange's normal trading fees and nothing else to use the terminal on centralized exchanges.
- **Key storage.** API keys you add go into your browser's local storage, encrypted, not a central database. You can check: open a fresh browser and the keys aren't there, or inspect local storage from the developer console. Optional key sync across devices exists and requires 2FA.
- **Data.** We don't collect or use your trading data (positions, stop losses and so on). Only your login email and password are stored, held with Auth0.
- **Connection drops.** If the live connection to the exchange drops, Hobble Mode puts the terminal into a passive mode that keeps tracking orders and positions.

> **Terminal tip:** Keep the terminal in one dedicated browser tab and use its internal tabs for extra views. We can't guarantee performance inside another app, and running multiple browser tabs slows it down (more on our [Performance](https://docs.insilicoterminal.com/documentation/application-elements/performance) page).

## Where a Terminal Helps Most

A terminal pays off fastest if any of these sound like you:

1. You trade on two or more venues and want the positions side by side.
2. You regularly enter or exit size that moves the book and would get better fills with TWAP, scale or chase.
3. You scalp and want keyboard or CLI execution instead of forms.
4. You run several sub-accounts and keep losing track of which one is active.

Here's a quick test. Count how many orders you placed last week and then had to fix because of wrong size, wrong account or wrong side. Anything above zero is the interface costing you money.

> **In the docs:** Setup is two steps. Register at insilicoterminal.com, then create an exchange API key with the per-exchange guide and add it under Settings. Never enable withdrawals on that key.

## Frequently Asked Questions

### Does a trading terminal hold my crypto?

No. Your funds stay on the exchange. The terminal uses an API key to read balances and send orders, and it can only do what that key's permissions allow. Create keys with trading on and withdrawals off.

### Is Insilico Terminal free?

Yes, on centralized exchanges you only pay the exchange's normal trading fees. We have brokerage deals with exchanges, similar to referral programs, so they pay us for the volume instead of you. On DEXes like Hyperliquid, a small builder fee of 1 bp (0.01%) is added per trade.

### Is a terminal faster than the exchange website?

It can be. Raw speed depends on your connection, the exchange's API and how the software is built. For most traders the bigger gain is fewer steps per order. Hotkeys, CLI commands and preset sizes shorten the gap between deciding and getting the order in.

### What happens to my orders if I close the browser?

With standard Insilico orders, client-side logic like a running chase or TWAP stops, since these need the browser open. Plain resting orders are already on the exchange and stay there. Cortex runs orders on our servers instead and keeps them live after you disconnect, on Hyperliquid, Bybit, OKX and Lighter.

### Can I use a terminal on my phone?

Insilico Terminal works on mobile through the browser. Log in and add your API keys again on the new device, because keys are stored per browser unless you turn on sync.
