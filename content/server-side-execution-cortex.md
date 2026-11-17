---
title: "Server-Side Execution: Why Your Orders Should Outlive Your Browser"
slug: server-side-execution-cortex
category: Cortex
cover: cortex
theme: black
short: "Orders That Outlive Your Browser"
level: Intermediate
excerpt: "Why browser-run algos stop when you close the tab, what Cortex's server-side execution changes, and what to check before you rely on it."
docs:
  - title: "Setup"
    url: "https://docs.insilicoterminal.com/documentation/cortex/setup"
  - title: "Server-Side Execution"
    url: "https://docs.insilicoterminal.com/documentation/cortex/server-side-execution"
  - title: "TWAP Execution"
    url: "https://docs.insilicoterminal.com/documentation/cortex/twap-execution"
  - title: "Conditional Orders"
    url: "https://docs.insilicoterminal.com/documentation/cortex/conditional-orders"
  - title: "Activity and Order History"
    url: "https://docs.insilicoterminal.com/documentation/cortex/activity-and-order-history"
---
Your six-hour TWAP is halfway through when the laptop battery dies. The exchange had no idea a TWAP was running. All it saw was a stream of orders from your browser, and then the stream stopped. Any algorithm a terminal runs, TWAP, chase or scale, has to live somewhere, and if that somewhere is a browser tab, it dies with the tab. Cortex moves that logic onto our servers. Here's what changes, how to set it up, and what to check before you hand it real size.

## Exchanges Don't Run Your Algos

Exchanges accept a short list of native order types: market, limit, and usually stop and take-profit triggers. Anything smarter, like splitting an order over hours, tracking the best bid or waiting for a candle close, has to be run by something outside the exchange that watches the market and fires plain orders at the right time.

A terminal can run that logic in one of two places:

- **Client-side:** in your browser. The tab holds the schedule, watches the book and sends each order with your API key.
- **Server-side:** on the terminal provider's servers. You hand over the instructions once, and the server sends the orders whether you're watching or not.

Either way the exchange just sees normal orders. What differs is what happens when your end of the connection disappears.

## What Happens When the Tab Closes

Standard Insilico Terminal orders are client-side. The browser has to stay open for the whole execution, and closing the Terminal ends a TWAP.

Say you're selling 30 SOL in 60 lots over six hours, one lot every six minutes. Close the tab three hours in and you've sold about 15 SOL. The other 15 never go out, and there's no error on the exchange, because from its side nothing broke.

Chase behaves the same way. The chase logic keeps moving your limit to follow the quote, and once the browser is gone the moving stops. You're left with whatever limit order happened to be resting at that moment, so check your open orders on the exchange instead of guessing.

Crashes aren't the only limit, either. Client-side TWAPs in Insilico Terminal max out at 12 hours, which rules out the multi-day accumulation or distribution institutional desks run.

![Market TWAP order form for 1 BTC with Total Time 3h 38m, 19 lots of 0.05263 every 12m, and Reduce, Obfuscate and Price Bounds options](/learn/assets/figures/ui-twap.png "A client-side Market TWAP: 1 BTC over 3h 38m in 19 lots, one every 12m, running only while this tab is open.")

## What Cortex Changes

Cortex is our server-side execution engine. An order placed through Cortex goes to our servers and runs there. Close the browser, shut down the machine, lose your connection, switch devices: the order keeps going.

- **Long-duration execution.** Cortex orders can run for days, weeks or months, with no browser uptime requirement and no 12-hour cap. A Cortex TWAP takes a Total Size, Total Lots, a Total Time or End Date, and a per-lot Slippage tolerance. The stealth options from client-side TWAPs (Obfuscate and Price Bounds) are still there, and each lot can execute via Chase or Swarm instead of a plain market order.

![Limit Chase TWAP order form with Total Time, Total Lots, Chase Duration, Fallback set to Market or Add to Next, and Reduce, Obfuscate and Price Bounds](/learn/assets/figures/ui-chase-twap.png "Chase TWAP chases each lot for a set Chase Duration, then falls back to Market or adds the leftover to the next lot.")
- **Conditional orders.** You can gate any supported order type behind up to five trigger conditions (Price, Candle Close, Candle Volume or Time) joined with AND or OR. The server checks them in real time, so "start a TWAP when the 4h candle closes above this level" is one instruction, not an alarm on your phone.
- **Cross-device control.** Every Cortex task shows up on any device logged into your account. Start a TWAP on the desktop, check it on your phone, cancel it from the laptop.

A worked example. You want to accumulate $200,000 of a token over two weeks without looking like an obvious buyer. Client-side, there's no single order that does that. In Cortex it's one TWAP: end date two weeks out, a few hundred lots with Obfuscate on, price bounds around the range you're happy to buy in, and each lot executed as a chase so you fill passively where you can. Add a Time condition if you want it to kick off at a specific UTC hour.

## Setting It Up

Cortex is opt-in. You turn it on from the **Cortex** section in the Settings sidebar, and you need an Insilico Terminal account, at least one exchange API key already in the Terminal, and 2FA on your Insilico account.

Activation is four steps:

1. **Enable 2FA.** It's mandatory, and you'll be prompted if it's off.
2. **Sync API keys.** Your exchange keys are synced to the Cortex backend so it can place orders server-side for you.
3. **Verify device.** Authorize Cortex on the device you're using.
4. **Sync accounts.** Pick which exchange accounts to sync. Each synced account shows a **SYNCED** status.

![Settings Cortex page with the Cortex toggle on, steps Enable 2FA, Sync API keys, Verify device and Sync accounts all checked, a SYNCED account, and Add a new account buttons for Bybit, Hyperliquid, OKX and Lighter](/learn/assets/figures/ui-settings-cortex.png "Cortex settings with all four steps checked, one SYNCED account, and new accounts available for Bybit, Hyperliquid, OKX and Lighter.")

You can add more accounts later under **Add a new account** in the Cortex settings panel. Cortex runs on Hyperliquid, Bybit, OKX and Lighter, and conditions don't have to watch the venue you execute on: a Hyperliquid price can trigger a Bybit order, and vice versa.

> **Risk note:** Without Cortex, your API keys stay in your browser. Turning it on means syncing them to our backend, since a server can't sign orders with keys it doesn't hold. Only sync the accounts that need server-side execution, and keep those keys trading-only. A trading key should never have withdrawal permission.

## Watching It Work: Activity and History

Cortex tasks show up in the **Activity** panel alongside your client-side activity. Each row has symbol, type, progress, duration, size, price (current or average fill) and a details summary such as the execution method. Expand a task for full execution detail, and cancel it whenever you like.

Below that, every task keeps an execution history. Each lot or fill shows its status (filled, pending or failed), execution price, filled size against target, and a timestamp. TWAPs also get overall progress, average fill price, start time and estimated end.

Errors like an exchange rejection or insufficient margin are logged with details in the task history. Get in the habit of reading it. A failed lot in a two-week TWAP isn't going to wake you with a popup at 3 a.m.; it'll just be sitting there the next time you look.

## What to Verify Before You Trust It With Size

Server-side execution takes your browser out of the list of things that can fail. Everything else is still on it. Before running anything big:

- **Confirm the account is synced.** Look for SYNCED on the exact account you plan to trade. A key added to the Terminal isn't automatically a key synced to Cortex.
- **Run a small test.** Start a short TWAP with a few lots, close the browser, come back later. Progress should have moved and fills should be in the history.
- **Check from a second device.** Open the Activity panel on your phone. If the task isn't there, it isn't a Cortex task.
- **Read the per-lot history, not just the progress bar.** Failed lots are usually the first sign of thinning margin or exchange rejections.
- **Budget margin for the whole run.** A position built over weeks ties up margin over weeks, and funding, other positions and price moves can all eat what your later lots need.
- **Test your cancel.** Cancel the test task from a different device than the one that started it, and make sure it stops.
- **Know your conditional logic.** With OR, the first condition met fires the order and the rest are ignored. With AND, every condition has to be true at the same moment. Mix them up and your confirmation filter becomes a hair trigger.

> **Terminal tip:** Put Price bounds on any TWAP that runs for days, and decide before you start what should happen when price leaves them. An unbounded schedule will keep buying into a move you never planned for, long after you've stopped watching.

## Frequently Asked Questions

### Does a normal Insilico TWAP keep running if I close the browser?

No. Standard Terminal orders run client-side and need the browser open the whole time, so closing the Terminal ends a client-side TWAP. They're also capped at 12 hours. If you need execution that carries on without the browser, use a Cortex TWAP.

### Which exchanges does Cortex support?

Hyperliquid, Bybit, OKX and Lighter. Conditional orders can also work across venues, for example a Hyperliquid price condition that releases an order on Bybit. Sync every account you want Cortex to trade before planning around it.

### Are my API keys stored on your servers if I use Cortex?

Only if you turn it on. Cortex is opt-in, and enabling it syncs your exchange API keys to the Cortex backend so orders can be placed server-side. It needs 2FA and device verification. If you never enable Cortex, your keys stay in the browser as before.

### How do I know a Cortex order failed?

Open the task in the Activity panel and look at its execution history. Each lot or fill shows filled, pending or failed, with price, size and timestamp. Errors like exchange rejections or insufficient margin are listed there with details.

### Can I cancel a Cortex task from my phone?

Yes. Cortex tasks and their history are visible on any device logged into your account, and you can cancel or manage running tasks from any of them. You don't need the device that created the order.
