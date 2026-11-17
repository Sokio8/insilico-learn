---
title: "Basket Trading: How to Trade a Thesis With Complex Orders"
slug: basket-trading-complex-orders
category: Execution
cover: basket
theme: black
short: "Trade a Thesis, Not a Ticker"
level: Advanced
excerpt: "Turn a market view into a weighted basket of longs and shorts, size each leg, then execute, save and share it with Complex Orders."
docs:
  - title: "Basket Trading"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/basket-trading"
  - title: "Workspace"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/workspace"
  - title: "v6.0.1"
    url: "https://docs.insilicoterminal.com/documentation/changelog/v6.0.1"
  - title: "v4.0.41"
    url: "https://docs.insilicoterminal.com/documentation/changelog/v4.0.41"
  - title: "v4.0.36"
    url: "https://docs.insilicoterminal.com/documentation/changelog/v4.0.36"
---
Most of the views worth trading aren't about one coin. "AI tokens will outperform" or "this sector is overheated" is a call on a group, usually relative to something else. Push that through a single ticker and you pick up risk you never wanted: one project's news, one token's unlock, one venue's funding rate. A basket puts the exposure on the idea instead. Below is how I'd build one, size and hedge the legs, and then execute, save and share it with the Complex Orders component in Insilico Terminal.

## What a Basket Trade Is

A basket is a set of positions you open together as one trade. Each position is a leg. A leg can be long or short, and its weight sets how much of the total size it gets.

You'll reach for a basket in a few situations:

- **Sector views.** You expect a theme to move but can't say which token leads. Owning four or five names spreads the single-name risk.
- **Relative value.** You think one group beats another no matter where the market goes. Long the group you like, short the one you don't.
- **Hedged exposure.** You want the theme without the market. Pair a sector long with a BTC short and you strip out part of the broad move, leaving something closer to the sector's own performance.

The example we'll use throughout: you expect AI-related tokens to outperform over the next few weeks, but you don't want to lose money just because BTC drops. So the trade is long an AI basket, short BTC.

## Building the Thesis Into Legs

Start with what would prove you wrong. Then pick legs that isolate the idea.

### Long Legs

Take four or five liquid tokens that obviously belong to the theme. Liquidity beats story here, because a leg you can't exit at size is a liability. Skip names with known supply events inside your holding window.

### The Hedge

For a crypto sector view BTC is the usual hedge, since most tokens move with it. ETH or a broader index perp can work too, depending on what you're trying to strip out.

### Neutrality Target

- **Dollar neutral:** long and short notional are equal. Easy to set up, but if your longs are more volatile than BTC you're still net long the market.
- **Beta neutral:** the short is sized so a market move hits both sides about equally. If the AI basket has historically moved around 1.5 times as much as BTC, you short about 1.5 dollars of BTC for every dollar of basket.

Beta estimates drift, small caps especially. Use them as a rough guide and recheck them if you're holding for weeks.

## Sizing the Legs: A Worked Example

Say you have a $10,000 account and want a basket with $16,000 total notional. The numbers are illustrative.

```bars
title: $16,000 basket, dollar neutral
unit: $
caption: Four $2,000 longs (12.5% each) against one $8,000 BTC short (50%).
AI token A: Long 2000 | 12.5%
AI token B: Long 2000 | 12.5%
AI token C: Long 2000 | 12.5%
AI token D: Long 2000 | 12.5%
BTC: Short 8000 | 50%
```

That's dollar neutral: $8,000 long, $8,000 short. Gross exposure is $16,000, or 1.6 times the account. To go beta neutral with an assumed beta of 1.5, the BTC leg grows to $12,000. Weights shift to 10% per AI leg and 60% for BTC on $20,000 total, and gross exposure climbs to 2 times the account.

Now set the risk. Suppose you're willing to lose 2% of the account ($200) on the idea, and you'd get out if the basket underperforms BTC by about 2.5%. Then $8,000 per side fits, because 2.5% of $8,000 is $200. Want a wider exit? Bring the size down.

> **Risk note:** A hedged basket still carries risk. The legs can move against each other, with the AI tokens falling while BTC rallies. Every leg also has its own leverage and liquidation price, so check each one's margin and not just the net exposure.

## Executing With Complex Orders

You build and execute baskets in the Complex Orders component.

1. Click **Create** in the Complex Orders component.
2. Add the account or accounts you want to use, and name the basket if you like.
3. Select the pairs. The green button adds a pair on the long side, the red button on the short side. Pairs can come from multiple accounts and exchanges.
4. Use **Split equally** or **Equal L/S** to set the weights, or set each leg yourself with its slider or **Weight %** field. Lock a weight to keep it fixed.
5. Enter the total size in USD, choose the order type to execute with, and turn on **Reduce** or **TP/SL** if you want them.
6. Press **Execute** to place every leg as shown in the table.

![Manage basket dialog named AI basket vs BTC with market search and green long and red short add buttons per market](/learn/assets/figures/ui-basket-builder.png "Name the basket, search markets, and add each one with the green long button or the red short button.")

![Complex Orders with the AI basket vs BTC: Long 50% / Short 50% bar, Split equally, Equal L/S, legs with weight %, Market order, Notional, Reduce, TP/SL, Execute and Reverse](/learn/assets/figures/ui-basket.png "The bar on top shows the long and short split, and Execute and Reverse sit under the order type and notional.")

Since v6.0.1 there are two separate buttons. **Execute** places the legs exactly as built. **Reverse** places every leg on its opposite side as a one-off. Complex Orders have also supported TP/SL since v4.0.36.

> **Terminal tip:** To exit the whole basket at once, use Reverse with the **Reduce** toggle on. Each opposite-side order can then only close what you hold, so an accidental double-click can't flip you into the reverse trade.

### Choosing the Order Type

You pick one order type for the whole basket, so choose it for your least liquid leg, not your most liquid one. Market execution gets you into every leg fast but pays spread and slippage on each, and on thin legs that adds up. Still, if the idea plays out over weeks, a few basis points saved on entry matter less than being fully hedged from the first minute. A half-filled basket (long the AI legs with no BTC short) is a directional bet you didn't mean to make.

## Multi-Account Baskets

Insilico Terminal connects all your accounts at once, and the basket builder takes legs from multiple accounts and exchanges. Some setups that makes possible:

- Run the long legs on whichever venue has the best liquidity for those tokens, and the BTC short somewhere else.
- Keep the hedge on its own sub-account so its margin is isolated from the longs.
- Split a large basket across accounts to stay inside per-account position limits.

The catch is margin. Positions on different accounts don't share collateral. If BTC rips, the short on one account can drift toward liquidation while the winning legs sit on another account and can't help. Size each account so its legs survive the move you're hedging against, on their own.

> **In the docs:** the basket builder is account-aware from the first step. You add accounts when you create the basket and can choose pairs from any of them, so decide which exchange holds which leg before you start building.

## Saving and Sharing Baskets

Complex Orders lets you save baskets as well as execute them, which is handy for views you come back to. Build the AI basket once and reuse it later without typing in every leg and weight again. Since v4.0.41 you can also share baskets with other Insilico Terminal users, the same way you share layouts.

If you're about to run a basket someone else built, check it like you'd check your own. Confirm each leg's side, weight and account mapping, and make sure the hedge matches the neutrality you want. A shared basket comes with the author's thesis, not your risk limits.

## Frequently Asked Questions

### What is a basket trade in crypto?

It's several positions opened at once as a single trade, each with its own side and weight. You use it to trade a theme, like a sector or a relative-value view, instead of betting on one token. Baskets can be all long, all short, or mixed with a hedge.

### Can a basket mix long and short positions?

Yes. In Complex Orders you add each pair with the green button for long or the red button for short. A common setup is a sector long against a BTC short, which cuts your exposure to overall market direction.

### How do I close an entire basket at once?

Press Reverse with the Reduce toggle enabled. Reverse places every leg on its opposite side, and Reduce makes sure those orders can only close existing positions, not open new ones.

### Can I use different exchanges in one basket?

Yes. You add the accounts you want when you create the basket, then pick pairs from any of them across exchanges. Keep in mind that each account has its own margin, so profits on one account won't support a losing leg on another.

### Should I weight a basket equally?

Equal weights are a fine default when you have no strong view on which leg leads. Change them when legs differ a lot in volatility or liquidity, or when you want the hedge sized to beta instead of dollars. You can edit each leg in the Weight % column before executing.
