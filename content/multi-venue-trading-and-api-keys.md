---
title: "Trading Across Exchanges: Multiple Accounts, Venues and API Key Security"
slug: multi-venue-trading-and-api-keys
category: Security
cover: venues
theme: white
short: "Many Venues, Safely Connected"
level: Beginner
excerpt: "Why traders spread across exchanges and DEXs, and how to connect each venue with a safe API key and run every account from Insilico Terminal."
docs:
  - title: "Creating an API Key"
    url: "https://docs.insilicoterminal.com/documentation/setup/creating-an-api-key"
  - title: "Security"
    url: "https://docs.insilicoterminal.com/documentation/welcome/security"
  - title: "Workspace"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/workspace"
  - title: "Balances"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/balances"
  - title: "Synchronize API Keys Across Devices"
    url: "https://docs.insilicoterminal.com/documentation/setup/synchronize-api-keys-across-devices"
  - title: "Frequently Asked Questions"
    url: "https://docs.insilicoterminal.com/documentation/welcome/frequently-asked-questions"
---
Hardly anyone who trades actively keeps everything on one exchange. Liquidity sits in different places, new listings show up on one venue first, funding rates drift apart, and any single exchange can fail on you. So you spread out, and every venue you add brings another login, another balance and another API key. Each of those keys works like a password with a scope attached, so how you set it up matters as much as where you trade. Here's why traders go multi-venue, how to connect each exchange safely, and how to run all of it from one screen in Insilico Terminal.

## Why Traders Spread Across Venues

**Liquidity.** Depth isn't the same everywhere. The venue with the tightest BTC book can be thin on a mid-cap alt. If you trade size, where you execute decides how much slippage you eat.

**Listings.** New assets often list on one exchange or DEX first. No account there, no trade.

**Funding.** Perp funding is set per venue and can differ for the same asset. If you hold for days, you care where funding is cheapest.

**Counterparty risk.** A centralised exchange holds your collateral, and exchanges halt withdrawals, get hacked and go under. Splitting capital means one bad event doesn't take the lot. On-chain venues swap that for a different set of risks: smart contracts, bridges and wallet security.

**Account separation.** Plenty of traders run sub-accounts even on one exchange, say one for scalping and one for longer-term positions, so margin and P&L don't bleed into each other.

The price you pay is operational. Every venue has its own interface, order types and quirks. Flipping browser tabs to check a stop on another exchange takes seconds you might not have, and working out your real exposure means doing sums in your head. A unified terminal solves both of those. Key hygiene stays your job.

## Venues You Can Connect

Insilico Terminal currently supports these venues:

- **Futures and derivatives:** Binance (including Multi-Assets Mode), Bybit (including Unified Trading Accounts), OKX, Bitget, Coinbase, BloFin, Kraken, Kalshi Perps, Crypto.com
- **Spot:** Binance, Bybit, Coinbase, Kraken
- **DEX:** Hyperliquid (perps, spot, HIP-3 markets and HIP-4 outcome markets), Lighter, Extended, Apex, Nado, Robinhood Chain Lighter, Ondo Perps

Every venue has its own setup page in our [Creating an API Key](https://docs.insilicoterminal.com/documentation/setup/creating-an-api-key) guide, and Hyperliquid has a separate [connection guide](https://docs.insilicoterminal.com/documentation/setup/adding-hyperliquid). We add venues over time, so check there for the current list before you open an account somewhere just to trade it through the Terminal.

Setup isn't identical across venues. Bitget, OKX, BloFin and Apex want a passphrase on top of the key and secret, and Apex also needs an OMNI Seed. Hyperliquid has to be connected once through a browser wallet extension to sign the builder fee before the API key method works. Several on-chain venues use a wallet signature instead of a pasted key. Follow the guide for each one.

![Add an account picker with API and WALLET badges for each venue](/learn/assets/figures/ui-add-account.png "API venues take a pasted key, WALLET venues connect with a wallet signature.")

## One API Key Per Venue

Creating a key gets you two strings from the exchange: a public **key** that identifies it and a **secret** that signs requests. Some exchanges also have you pick a **passphrase**. Anything signed with the secret is treated as coming from you, within whatever the key is allowed to do.

How much damage a key can do comes down to three settings:

| Property | Question it answers | Safe default for a trading terminal |
|---|---|---|
| Permissions | What can the key do? | Read and trade only |
| IP restriction | Where can the key be used from? | Only the terminal's server IPs |
| Lifetime | How long does it work? | As short as is practical; rotate regularly |

We recommend a separate key for each platform and each application you use. If one leaks, you know exactly where it came from, you can kill it without touching the others, and it helps with any disputes later. Never share a key with anyone.

### Permissions: Trade Yes, Withdraw Never

A terminal has to read your balances and positions and place and cancel orders. Moving funds off the exchange isn't part of the job, so never enable withdrawals.

Each exchange labels "trade" a bit differently. Here are the boxes to tick:

- **Bybit:** enable **Orders** and **Positions**, leave withdrawals off, and select the **Insilico Terminal** application. Unified Trading Accounts need a few extra settings, shown in our guide.
- **Binance:** enable **Spot & Margin Trading** and **Futures**, no withdrawal access. If those options are greyed out, uncheck **Default Security Controls** first. If regional rules block futures, a spot-only key works too.
- **OKX:** enable **Trade**. You'll set a passphrase while creating the key. Write it down, because the Terminal asks for it.
- **Others:** Kraken needs full General API access and no Withdrawal API access ([Kraken guide](https://docs.insilicoterminal.com/documentation/setup/creating-an-api-key/creating-a-kraken-api-key)); [Bitget](https://docs.insilicoterminal.com/documentation/setup/creating-an-api-key/creating-a-bitget-api-key) needs Futures Orders, Futures Holdings, Spot and Margin; [Coinbase](https://docs.insilicoterminal.com/documentation/setup/creating-an-api-key/creating-a-coinbase-api-key) needs View and Trade, and a separate key per portfolio if you trade both spot and perps.

Any guide or app that asks you to turn on withdrawals or transfers to outside addresses should set off alarms.

> **Risk note:** Trade-only doesn't mean harmless. Someone with your key can open oversized positions, crank leverage to the max, or dump size into an illiquid pair where they're sitting on the other side. Turning off withdrawals limits the damage. It doesn't remove it.

### IP Whitelisting, Venue by Venue

With an IP restriction, the exchange rejects any request that comes from an address not on your list. A leaked key and secret won't work from an attacker's machine.

With Insilico Terminal, requests come from our servers, so you whitelist our IPs, not your home connection. Each exchange handles this its own way:

- **Bybit:** pick "Connect to Third Party Application" and select Insilico Terminal. Bybit then locks the key to our IP range for you, so there's nothing to whitelist by hand.
- **OKX:** choose **Linking third-party apps** and select Insilicoterminal, and the key gets restricted to the Terminal's IPs automatically. Make a general key instead and you'll have to whitelist the 20 server IPs from our guide yourself.
- **Binance:** select **Restrict access to trusted IPs only** and paste in the server IP list from our guide. There are 35 addresses and you need every one. Binance will also run unrestricted, but we recommend the restriction.
- **Bitget, Kraken, [BloFin](https://docs.insilicoterminal.com/documentation/setup/creating-an-api-key/creating-a-blofin-api-key), [Apex](https://docs.insilicoterminal.com/documentation/setup/creating-an-api-key/creating-an-apex-api-key):** each exchange has its own IP set for optional or recommended restriction, listed in its key guide. Copy the whole list exactly and check that the address count matches.

The mistake we see most is a partial list. When some requests go out through an IP you missed, you get random errors and it looks like the terminal is broken.

## Running Several Accounts Side by Side

Insilico Terminal connects all your accounts at once, and you pick which one each component views or trades. Nearly every component has an account menu, and there's an account selector in the header for switching between connected accounts. In the CLI, `account list` shows your accounts and `account <number>` switches to one.

![Component account menu with Add Account, Account list and None](/learn/assets/figures/ui-account-menu.png "Each component's account menu sets which account it views and trades.")

```cli
# list connected accounts
account list
# switch to account number 3
account 3
# check the balance on the account you just switched to
bal
```

What works well is one link colour per account. Chart, place order form and positions panel for venue A in one colour, venue B's set in another. Each group stays tied to its account, and the colour tells you at a glance where an order is going. You pick the colour from the chain icon in each component header. Give your hotkeys an account, a symbol and a link colour too, so a keypress can't land on the wrong venue.

![Link Group menu with Unlinked, Orange, Teal, Blue, Purple, Pink and Apply to all](/learn/assets/figures/ui-link-group.png "Pick a link colour per venue; Apply to all puts every component on the same colour.")

> **Risk note:** Leverage and liquidation are per account. A position that looks hedged across two venues is really two positions with two liquidation prices. If one side gets liquidated in a spike, the other is suddenly naked.

### One View of Your Balances

The Balances component tracks assets across every exchange account you've connected, not just the one you're trading on. It sums your holdings, lets you search and filter, and can hide dust.

It's most useful as a check before you start trading. Confirm where your free margin sits first. If a setup appears on a venue where you're short on collateral, you'll know before you try to place the order instead of finding out from the rejection.

## Where Your Keys Are Stored

You should ask this of any tool you hand a key to. Here's how it works with us:

- Keys you add are saved, encrypted, to your **browser's local storage**, not to a central server or database.
- They're **decrypted just-in-time** to sign a request and then discarded.
- You can check this yourself. Log in from a fresh browser and the keys won't be there, or press F12 and look at local storage in the developer console.
- Other than your login email and password (held with Auth0), we store nothing else about you, and we don't collect or use your positions and stop losses.

The downside of local-only storage is that clearing your browser data or moving to a new machine wipes your keys, and every new device needs them added again.

### Optional Sync Across Devices

The opt-in Synchronize API Keys feature stores keys on our servers so you can pull them onto other devices. Here's how to set it up:

1. Enable 2FA on your account. Sync requires it.
2. Go to Settings > Accounts, open the **SYNC** tab, enable **Sync API keys**, and verify the device through the email link.
3. Manage and remove verified devices under the **SYNC** tab. Removing a verified device disables the keys stored locally on it.
4. Under the **ACCOUNTS** tab, upload local accounts one by one or click **SYNC ALL**, and leave out any you want to keep local. Synced accounts show up under **Remote account** with an expiry.
5. On a new device, log in, open the **SYNC** tab, verify the device by email, then click **RETRIEVE** in the **ACCOUNTS** tab. Turn on **Auto connect all accounts** to connect every account automatically.

![Settings Sync tab with Sync API keys and verified and unverified devices](/learn/assets/figures/ui-settings-sync.png "The SYNC tab lists verified and unverified devices; remove any you don't recognise.")

Synced keys are encrypted with AWS Key Management Service and held in an isolated environment. You're still trading convenience against exposure, because your keys now exist somewhere other than your machine. You can leave sensitive accounts out of sync entirely, and we'd do that for your largest one by default.

> **Terminal tip:** Turn on 2FA in Settings under the "2FA" tab even if you never touch sync. Allow pop-ups for the site, since 2FA briefly opens one to fetch the token.

## Expiry and Rotation

A key that never dies picks up risk over time from old laptops, stale browser profiles and that screenshot you pasted into a support chat. Rotate on a schedule, and right away after anything that could have exposed one.

Plenty of exchanges expire keys on their own anyway, often faster when there's no IP restriction. Look up the expiry date on your exchange's API management page so a key doesn't die in the middle of a trade.

To rotate without a gap in trading:

1. Create the new key with the same permissions and IP restriction.
2. Add it to the terminal under a new name, for example "bybit-main-2026-11".
3. Check that it connects and shows balances.
4. Delete the old key **on the exchange**, not just in the terminal. Removing it from the terminal only makes the terminal forget it.

## Phishing and Compromised Keys

Permissions and IP rules do nothing if you hand a key to the wrong person, and that's how most keys get stolen. Here's what to watch for:

- **Nobody from our team will DM or email you first.** Ignore any user called "Insilico" offering to help.
- **Fake "Insilico Whitelist" bots** and similar names are running on other servers. We'd never use names like that.
- **Promos, deals and sign-up offers** from accounts in the Discord should be reported.
- **Use the correct URL:** insilicoterminal.com. Bookmark it and only go in through the bookmark.

One rule handles most of it: no legitimate person ever needs your API secret, your passphrase or your wallet private key. Support won't ask.

If you suspect a key is compromised, revoke it on the exchange first, then deal with whatever's open. In Insilico Terminal you can flatten fast from the CLI with these, from our [General Commands](https://docs.insilicoterminal.com/documentation/terminal-cli/general-commands) page:

```cli
# cancel every open order
nuke orders
# close every open position
nuke positions
```

After that, change your exchange password, go through the exchange's API and login history, and make a fresh key.

## A Workable Multi-Venue Routine

- **Name accounts and keys clearly.** "Bybit scalp" and "HL swing" beat "Account 1" and "Account 2" when you're reading a window title mid-move.
- **Use one link colour per venue** and keep it consistent across tabs, even though each tab's colours work independently.
- **Check Balances before the session** and move collateral before you need it, not during the move.
- **Keep a written list of which keys are synced**, where, and when each one expires.
- **Revoke keys on the exchange** as soon as you stop using them, and rotate the rest on schedule.

## Frequently Asked Questions

### Can I trade several exchanges at the same time in Insilico?

Yes. You connect all your accounts at once and choose the account for each component from its account menu. Link colours keep each venue's components grouped, so you know where every order goes, and the Balances component shows holdings across all of them.

### Should I ever enable withdrawals on a terminal API key?

No. A trading terminal only needs to read and trade, so create every key without withdrawal access.

### How do I whitelist IPs on Bybit and OKX?

Create the key through the exchange's third-party app option and select Insilico Terminal. Bybit's "Connect to Third Party Application" and OKX's "Linking third-party apps" both lock the key to our IPs for you.

### Where does Insilico store my API keys?

By default, encrypted in your browser's local storage, not on our servers. They only go server-side if you turn on the opt-in sync feature, which requires 2FA and lets you choose which keys get uploaded.

### Why did my accounts disappear after clearing my browser?

Without sync, keys exist only in browser storage, so clearing site data or switching browser or device removes them. Add them again, or turn on sync for the accounts you want on every device.

### How often should I rotate API keys?

On a fixed schedule you'll actually stick to, and immediately after anything that might have exposed a key: a lost device, a shared screen, a login you don't recognise. Always delete the old key on the exchange itself, not just in the terminal.
