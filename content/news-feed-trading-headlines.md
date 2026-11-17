---
title: "How to Trade Headlines From the News Feed"
slug: news-feed-trading-headlines
category: News
cover: news
theme: green
short: "Trade the Headline From the Feed"
level: Beginner
excerpt: "Tune the News feed so it shows signal instead of noise, then react to a headline with linked charts and preset size buttons in Insilico Terminal."
docs:
  - title: "News"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/news"
  - title: "Link System"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/workspace/link-system"
  - title: "Hotkeys"
    url: "https://docs.insilicoterminal.com/documentation/application-elements/workspace/hotkeys"
  - title: "Market"
    url: "https://docs.insilicoterminal.com/documentation/market/market"
---
A headline can move a coin several percent before most people have finished reading it. Trading the news means acting in that window, and it rewards two things that pull against each other: speed and accuracy. Get there first on a misread post and you're the liquidity for everyone who read it properly. Wait for certainty and the move is already gone. Below is how we think about news trading, how to tune the News feed in Insilico Terminal so it surfaces what matters, and how to go from headline to position without fumbling the order.

## Speed Versus Accuracy

Every news trade is a bet on two things at once: that you understood the headline, and that the market hasn't priced it yet. The faster you act, the less time you've had to check the first part. The slower you act, the less likely the second part is still true.

You can make it easier on yourself. Decide in advance which headlines you'll trade fast (a listing, a hack, a big exchange announcement on a coin you follow) and which ones you'll only watch. Then reacting takes seconds instead of a minute of second-guessing.

## Why the First Print Isn't Always the Move

The first candle after a headline is often the least reliable part of the trade. A few reasons:

- **Headlines get corrected.** A post goes out, someone notices it's wrong or missing context, and a clarification follows minutes later. Price that ran on the first version comes back.
- **Thin books overshoot.** Liquidity providers pull quotes when volatility spikes, so a burst of market orders travels much further than it would on a quiet day. That wick can retrace just as fast.
- **The real reaction can come later.** Sometimes the first move is the bots. The bigger, slower flow arrives once people have read the details, and it can go the other way.

So read the first print for what it tells you, and wait for something firmer before you size up. If price has already run by the time you see the post, chasing it means buying from the people who were early.

## What the News Feed Shows

The News component streams market-relevant posts from default sources we curate, grouped into categories, plus up to 5 custom X accounts you add yourself. Items arrive live in near real time, and history loads when the component starts.

Each item shows:

- **Author and profile picture**, as a display name or @handle depending on your settings.
- **Timestamp and an age counter**, so you know how stale a post is.
- **The post text.** Click it to open the original post in a new tab.
- **Ticker tags** like $BTC, detected from the text. Coin-specific accounts show their coin's ticker even when the post doesn't mention it.
- **Price change since the post** for live items, the quickest way to see whether you're early or late.
- **Buy and Sell buttons** for each ticker, using the sizes you've set.

![News feed item from @Cointelegraph on ETF flows with $BTC, $ETH and $SOL tags, each showing its % change and Buy and Sell rows for $100, $500, $1.0K and $5.0K](/learn/assets/figures/ui-news.png "One headline, three tickers: each tag shows its change since the post, with green Buy and red Sell rows underneath.")

## Tuning the Feed for Signal

### Sources and Categories

Open the Sources settings and go through the categories. Each category header, and each source inside it, has four toggles:

| Toggle | What it does |
| --- | --- |
| Active | Includes the source in your feed |
| Notify | Lets the source trigger native OS notifications |
| Sound | Lets the source play your News sound |
| Filter | Shows only items that match a built-in list of important terms and buzzwords |

![News Sources settings with an Add Custom X/Twitter Sources field for up to 5 accounts and categories like Crypto-news, Crypto-media and Onchain with Active, Notify, Sound and Filter toggles](/learn/assets/figures/ui-news-sources.png "The Sources tab: add custom accounts at the top, then set Active, Notify, Sound and Filter per category or per source.")

The Filter is on by default for the coins and crypto-media categories, so a coin team posting "lol" or a giveaway doesn't reach your screen. It's off for news accounts, which mostly post headlines anyway. The news category starts disabled because it's high-volume, so expect a busy feed if you turn it on.

Use your 5 custom sources for accounts tied to what you trade, like a project you hold or an exchange's announcement account. Enter the handle with or without the @ and click Add.

### Whitelist and Blacklist

In the component settings you'll find two word filters, both separated by `;`:

- **Keyword Whitelist**: an item appears only if ANY of the words is in the text.
- **Keyword Blacklist**: an item is hidden if ANY of the words is in the text.

These are separate from the Filter toggle on sources, which uses our built-in term list. A tight whitelist like `listing;hack;exploit;ETF` makes for a very quiet feed, great when you only trade one kind of event and terrible if you forget it's set.

### Notifications

Be selective with Notify and Sound. If every source pings you, you'll mute the lot within a day. Keep alerts for the few sources you'd act on within seconds.

> **Terminal tip:** Turn off Show Retweets and Show Replies if your feed gets crowded. When they're on, retweets are marked RETWEETS and replies show REPLIES TO with the original author.

## Reacting to a Headline

1. **Read the age counter.** If the post is old and the price change is large, the easy part of the move is probably gone.
2. **Click the ticker tag.** Clicking only the tag (for example $SOL) links other components to that ticker. If your chart and order book share the News component's link colour, they switch to that coin before you trade.
3. **Check the chart and book.** Has price already spiked? Is the spread wide or the book thin? Then your fill will be worse than the last price suggests.
4. **Take a small first clip.** Use the smallest Buy or Sell button. That gets you into the trade while you read the details.
5. **Add if it holds.** If the headline checks out and price holds, add with a larger size or from your normal order entry. If it doesn't, you're out with a small loss.

You can set up to 4 size buttons in the component settings. Each one adds a Buy row and a Sell row per ticker, and a blank or 0 size disables that button. Button Size makes them taller, which helps when you're clicking fast.

![News component settings with Buy/Sell button sizes 100, 500, 1000 and 5000 USD, Button Size, Show Tickerless News, Tickerless Buttons, Default Ticker(s), Show Retweets, Show Replies, Show @Handles and Keyword Whitelist](/learn/assets/figures/ui-news-settings.png "The Component tab: four button sizes up top, then the tickerless, retweet, reply and @handle switches.")

### Headlines Without a Ticker

Macro posts often don't name a coin. Turn on Tickerless Buttons and enter up to 3 Default Ticker(s), such as `BTC;ETH;SOL`. Items with no detected ticker then get buttons for those coins, so a rate decision or a big regulatory headline is still one click away. If you'd rather see only posts with a ticker, turn off Show Tickerless News.

## Managing the Risk

- **Reversals.** Headlines get corrected, denied or clarified. Decide where you're wrong before you click, and get out when price says so.
- **Fake and hacked accounts.** Impersonators copy display names, and real accounts get compromised. Turn on Show @Handles so you see the @handle, and click through to the original post when in doubt.
- **Slippage.** In a spike, the price you see and the price you get can be far apart, and in a thin book your own size moves price against you.

> **Risk note:** Keep the sizes on your quick buttons small. The point is to get a first position on fast, then add with a clear head. If your largest button would hurt badly on a reversed headline, it's too big.

## A Practical Setup Routine

Do this once, then review it every week or two:

1. Set the News component's link colour to match your main chart and order book.
2. Leave Filter on for coins and crypto-media, and decide whether you want the news category on.
3. Add up to 5 custom sources tied to what you trade.
4. Turn on Notify and Sound only for sources you'd act on immediately.
5. Add a blacklist for words that keep showing up in posts you never trade.
6. Configure your size buttons from small to large, and disable any you don't need.
7. Set Default Ticker(s) if you trade macro headlines.
8. Turn on Show @Handles.
9. Assign a link colour to your hotkeys too, so a keypress always goes to the venue you expect.

## Frequently Asked Questions

### What is the difference between the Filter toggle and the whitelist?

The Filter toggle on a source or category uses our built-in list of important terms and buzzwords to cut noise like giveaways and small talk. The whitelist in the component settings is your own word list, and it shows an item only if ANY of your words appears in the text.

### Why does an item show a ticker the post doesn't mention?

Coin-specific accounts automatically show their coin's ticker, even when the post itself doesn't name it. If you've set Default Ticker(s) and turned on buttons for items without a ticker, those coins also appear on posts with no detected ticker.

### How do I check the chart before trading a headline?

Click the ticker tag on the item. Any component sharing the News component's link colour switches to that ticker, so your chart and order book update and you can see the move before you click Buy or Sell.

### Why am I not hearing news sounds?

Check that Notification Sound is on in the component settings, that Sound is enabled for the source or category, and that your global app sound setting is on. All three need to be set.
