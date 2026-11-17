---
title: "How to Connect Hyperliquid: Browser Wallet vs API Wallet, Step by Step"
slug: connect-hyperliquid-api-wallet
category: Setup
cover: hyperliquid
theme: black
short: "Connect Hyperliquid the Safe Way"
level: Beginner
excerpt: "Two ways to connect Hyperliquid to Insilico Terminal, what an API wallet can and can't sign, how to rotate it, and the errors people hit."
docs:
  - title: "Adding Hyperliquid"
    url: "https://docs.insilicoterminal.com/documentation/setup/adding-hyperliquid"
  - title: "Adding your API Key to the Terminal"
    url: "https://docs.insilicoterminal.com/documentation/setup/adding-your-api-key-to-the-terminal"
  - title: "Security"
    url: "https://docs.insilicoterminal.com/documentation/welcome/security"
  - title: "Cortex Setup"
    url: "https://docs.insilicoterminal.com/documentation/cortex/setup"
---
Hyperliquid doesn't have API keys the way a centralized exchange does. Your account is a wallet address, and anything that trades on it has to sign with a private key. You'd never hand your main wallet key to an app, so Hyperliquid lets you approve a separate signing key, called an API wallet, that trades for your account. Insilico Terminal connects either through your browser wallet extension or with an API wallet you enter by hand. Here's how both work, what an API wallet can do with your account, and the errors you're most likely to run into.

## How Hyperliquid Accounts and API Wallets Work

On a centralized exchange, the exchange holds your funds and gives you an API key with whatever permissions you ticked on a form. On Hyperliquid, your **master account** is the wallet you deposited from, and every action on it is a signed message.

A master account can approve API wallets to sign for the master account or any of its sub-accounts (details in [Hyperliquid's API wallet documentation](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets)). The API wallet is its own keypair. It signs but holds no funds, and if you query the API wallet's address you won't find much, because the account data lives on the master address.

That split is what keeps you safe. Your main wallet key stays in your wallet extension or hardware wallet, and the trading app only ever sees the API wallet key.

## What an API Wallet Can and Can't Do

Only some actions can be signed by an API wallet (the full list is on Hyperliquid's [exchange endpoint page](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint)). Placing, modifying and cancelling orders is what API wallets are for. A few transfer actions have restricted API wallet versions. The API wallet version of sending assets, for example, requires the destination to match the source address, so it can shuffle collateral between your own balances but can't send it to anyone else.

Withdrawal requests aren't on the list of API-wallet-signable actions. An API wallet key can trade your account, but it can't move your funds out.

Don't read that as "safe to leak". Someone with your API wallet key can open positions at max leverage, dump into thin books or churn fees until the account is gone, all without withdrawing a cent.

> **Risk note:** Treat the API wallet private key like a trading password. Anyone who has it can trade your account until you replace it.

## Method 1: Browser Wallet Extension

This is the default route, and you have to use it **at least once**, since it's where you approve the builder fee that enables Hyperliquid trading through the Terminal. You only sign it once per account.

**Prerequisites:**

- A browser wallet such as MetaMask, with ETH for gas on Arbitrum.
- USDC or another stablecoin on Arbitrum, if you haven't deposited yet.
- Your system time properly synced.

**If you don't have a Hyperliquid account yet:**

1. Open Insilico Terminal and go to the account menu.
2. Click **Add Account**, then select **Hyperliquid**.
3. Accept Hyperliquid's Terms of Use and Privacy Policy.
4. Choose the USDC amount to deposit and confirm in your wallet. The minimum is 5 USDC.

![Add an account picker with Hyperliquid marked as a WALLET venue](/learn/assets/figures/ui-add-account.png "Hyperliquid carries the WALLET badge in the account picker.")

**Adding the account to the Terminal:**

1. Enter a name for the account, for example "HL Main", and pick **Browser Wallet**, or **WalletConnect** if you sign from a mobile or hardware wallet app. Then click **Connect**.
2. Follow the wallet prompts to authorize the connection.
3. If you trade from a sub-account or a vault, enable that option and enter the sub-account name or address, or the vault address.

![Hyperliquid connect screen with Browser Wallet, WalletConnect and Manually add API key options](/learn/assets/figures/ui-hyperliquid-connect.png "Three ways in: Browser Wallet, WalletConnect, or Manually add API key.")

That's it. The account can now trade in the Terminal.

## Method 2: Manual API Wallet

Once the builder fee is signed, you can add Hyperliquid by hand with an API wallet. That's handy on a device without your wallet extension, or if you like a dedicated API wallet per setup.

1. **Deposit first.** You need a deposit in your Hyperliquid account before you start.
2. **Create the API wallet.** Go to the [Hyperliquid API page](https://app.hyperliquid.xyz/API), generate a new API wallet and authorize it with your main wallet.
3. **Copy the right two values.** Most people get this step wrong:
   - **Main Public Address** in Insilico = your **main wallet address**. Not the API wallet's address.
   - **Private Key** in Insilico = the **API wallet's private key**.
4. In Insilico, click **Add Account**, choose **Hyperliquid**, and click **Manually add API key**.
5. Enter a **Name**, the Main Public Address and the Private Key. To trade from a sub-account, open **Use a subaccount**.
6. Click **Connect**, confirm the connection succeeds, then click **Save**.

| Field in Insilico | What goes in it | Common mistake |
|---|---|---|
| Name | Any label you choose | None |
| Main Public Address | Your main wallet address | Pasting the API wallet's public address |
| Private Key | API wallet private key | Pasting your main wallet's private key |

![Hyperliquid manual form with Name, Main Public Address, Private Key and Use a subaccount](/learn/assets/figures/ui-hyperliquid-manual.png "The manual form wants your main address and the API wallet's private key, never your main wallet's key.")

Never paste your main wallet's private key into any app. If a setup flow asks for it, stop there.

> **Terminal tip:** Name each API wallet after where you use it, like "insilico-laptop". When you approve a new API wallet with the same name, Hyperliquid deregisters the old one, so rotating is one step.

## Where the Key Lives

Like every other exchange key, what you enter is stored encrypted in your browser's local storage, not in a central database. Clear your browser data and it's gone. A new browser or device starts empty. Keys are decrypted just-in-time to sign and then discarded.

Two opt-in features change that. API key sync stores keys encrypted on our servers and requires 2FA. Cortex, our server-side execution engine, runs on Hyperliquid, Bybit, OKX and Lighter, and syncs your keys to its backend so it can place orders for you when your browser is closed. It also requires 2FA and device verification. Turn on neither and your keys stay in the browser.

![Settings Accounts tab showing a synced remote Hyperliquid account with its expiry](/learn/assets/figures/ui-settings-accounts.png "Synced accounts show up as remote accounts with an expiry; local ones stay in this browser only.")

## Rotating and Revoking an API Wallet

API wallets cost nothing to create, so rotate them instead of running one forever. An API wallet gets deregistered when:

1. You approve a new **unnamed** API wallet, which replaces the existing unnamed one, or you approve a new API wallet with the **same name** as an existing named one.
2. The API wallet **expires**.
3. The account that registered it **no longer has funds**.

Never reuse an API wallet's address once it's been deregistered. Make a fresh one.

A clean rotation goes like this: create the new API wallet on the Hyperliquid API page, add it to Insilico with the manual method, check that it trades, then delete the old account entry in Insilico. If you suspect a key has leaked, rotate right away and go through your positions and order history.

## Common Errors and Fixes

- **"User or API Wallet ... does not exist."** Hyperliquid returns this when the signature recovers a different address than it expected. In a manual setup that's almost always a mismatched pair: the wrong address in Main Public Address, or a private key from a different or deregistered API wallet.
- **"Must deposit before performing actions."** The account has no funds, or the address you entered isn't the funded master account.
- **Connection fails right after adding.** Check your system clock. Synced system time is a prerequisite, and Hyperliquid's nonces are millisecond timestamps that have to land inside a window around block time.
- **Manual method rejected on a fresh account.** You haven't connected through the browser wallet and signed the builder fee yet. Do method 1 once.
- **Orders go to the wrong account.** If you use sub-accounts or vaults, confirm you entered the right name or address, and check which account is selected in each component.

You can check the result from the CLI. More commands are on our [General Commands](https://docs.insilicoterminal.com/documentation/terminal-cli/general-commands) page.

```cli
# list connected accounts to confirm the Hyperliquid entry is there
account list
# switch to the second account in the list
account 2
# show total and available balances for the active account
balance
```

## Frequently Asked Questions

### Can an Insilico-connected API wallet withdraw my funds?

No. Withdrawal isn't among the actions an API wallet can sign, and the API wallet's asset transfer requires the destination to be your own address. So an API wallet can trade your account but can't send funds out. It can still lose you money through bad or malicious trades, so guard the key.

### Why do I have to connect with my browser wallet first?

You need one browser wallet connection to sign the builder fee before Hyperliquid trading works in the Terminal. After that you can use the manual API wallet method.

### What do I enter as the address for Hyperliquid?

Your main wallet address goes in **Main Public Address**, not the API wallet's public address. The **Private Key** field takes the API wallet's private key. Mixing those two up is the most common setup error.

### Do you store my Hyperliquid API wallet key on your servers?

Not by default. Keys sit encrypted in your browser's local storage. They only go to our servers if you opt into API key sync or Cortex, and both require 2FA.

### How do I revoke an API wallet?

Approve a replacement on Hyperliquid's API page. Approving a new unnamed API wallet deregisters the previous unnamed one, and approving one with the same name replaces a named API wallet. API wallets also expire. Then remove the old entry from Insilico.
