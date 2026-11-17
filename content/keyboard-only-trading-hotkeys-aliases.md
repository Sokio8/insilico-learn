---
title: "Keyboard-Only Trading: Building a Hotkey Workflow With Binds, Aliases, Variables and Repeat"
slug: keyboard-only-trading-hotkeys-aliases
category: Terminal CLI
cover: hotkeys
theme: black
short: "Trade Without Touching the Mouse"
level: Advanced
excerpt: "Set up keyboard-only trading in Insilico Terminal with binds, aliases, variables, chaining and repeat, without letting a stray key hurt you."
docs:
  - title: "Shortcut / Hotkeys"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/shortcut-hotkeys"
  - title: "Alias"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/alias"
  - title: "User Defined Variables"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/user-defined-variables"
  - title: "Chaining"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/chaining"
  - title: "Repeat"
    url: "https://docs.insilicoterminal.com/documentation/terminal-cli/repeat"
---
A hotkey is a decision you made earlier, while calm, that you can fire later with one keystroke. That's why keyboard trading helps: the thinking happens before the move, not during it. In Insilico Terminal every key binding is created through the CLI, so anything you can type as a command can go on a key. We'll build a working setup from scratch with binds, aliases, variables, chaining and repeat, then walk through a sample scalping layout and the habits that stop a bad bind from costing you.

## Why Trade From the Keyboard

Speed is the obvious reason, but consistency is the bigger one. With a mouse you rebuild the order every time: find the field, type the size, pick the type, click. When you're tired or the market's loud, small errors creep in. A bound key sends the identical instruction every time.

That also means a wrong bind sends the identical mistake every time. Your keyboard setup is only as good as the care you put into it, so test every bind before you trust it.

## Binding Keys: Instrument or Global

The core command is `bind <key> "<command>"`, and the quoted part can be anything the CLI accepts. There are two scopes, and picking the right one is the biggest design choice you'll make.

- **Instrument binds** (the default) apply only to the current instrument and exchange.
- **Global binds** (`bind global`) apply to every instrument and exchange.

```cli
# list all your binds
bind list
# special key codes and examples
bind help
# bind b on this instrument only
bind b "chase buy 500$"
# global bind with a modifier
bind global ctrl+space "ui cli focus"
# remove one bind, or every bind on this instrument
unbind b
unbind all
```

One thing is worth spelling out. `bind global b "buy 1"` is dangerous, because `1` means one unit of the underlying, and one unit is very different money depending on the instrument. Size global binds in USD (`500$`) or from your position (`100%` with `reduce`, `$size`). Unit-sized binds belong at instrument scope, where the instrument can't change under you.

Most keys can take a bind: letters, digits, F-keys and special keys like Escape or Space, whose codes are in `bind help`. Modifiers (ctrl, alt/option, shift) combine with keys, e.g. `ctrl+a`.

![Hotkey configuration panel with Binds, Variables and Aliases tabs, Global selected, listing F7 nuke orders, F8 close long and Shift+F8 close short](/learn/assets/figures/ui-hotkey-binds.png "Hotkey configuration lists your binds by scope: here three Global binds, including Shift+F8 for close short.")

> **Terminal tip:** Key presses don't register while a text box has focus, and that includes the CLI input. After creating a bind, press TAB to leave the CLI before you test it. Putting `ui cli focus` on a global key gives you a clean way back in.

![CLI panel with help output listing bind help, bind list, alias list and print all, and a command typed in the input](/learn/assets/figures/ui-cli.png "The CLI input at the bottom has focus here, so hotkeys won't fire until you press TAB.")

## Aliases: Names for Long Commands

An alias saves a command under a short name you type into the CLI. No key needed. Use them for things you do on purpose rather than on reflex, where typing a word gives you a useful half-second to think.

```cli
# take profit on the whole position with a reduce-only chase
alias tpsell "chase sell 100% reduce"
# a named custom execution block
alias chadswarm "repeat 5 (swarm buy 100000$ into 5; sleep 5)"
# list, remove one, or clear all
alias list
unalias tpsell
unalias all
```

A good split: keys for anything you need in under a second, like entries, flattening and cancels. Aliases for multi-step routines, where a typo costs more than a second of thought.

## Variables: Change Size Once, Update Every Bind

User variables start with `@` and you create them with `set`. Once your binds use `@size` instead of a hard number, one command resizes the whole setup and you don't have to rebind anything.

```cli
# define sizes and offsets
set @scalp 500$
set @offset -0.1%
# check values
print all
# binds read the variables at the moment you press them
bind b "chase buy @scalp"
bind n "buy @scalp at @offset"
# size down for a choppy session
set @scalp 250$
```

Variables work for sizes, prices, order counts and even the scale method. Pair them with constants, which start with `$` and come from your position: `$size`, `$entry`, `$ordersize` from the linked order form, and `$quick1` to `$quick7` from the quicksize buttons. A pattern that works: set `@scalp` at the start of each session based on the day's volatility and never touch the binds.

## Chaining, Sleep and Repeat

Chaining lets one key do several things. `;` runs commands in sequence and `&` runs them in parallel. `sleep` pauses a sequential chain, in `ms`, `s` or `m`, up to 10 minutes.

```cli
# two entries on different instruments at once
buy 1000$ btcusdt & buy 2000$ ethusdt
# enter, wait 5 seconds, add a limit 1% lower
buy 1000$; sleep 5s; buy 1000$ at -1%
# three small buys half a second apart, on one key
bind digit2 "repeat 3 (buy 1; sleep 500ms)"
# manage running tasks
tasks
kill
kill all
```

Scalpers should read this one twice. `;` doesn't wait for the previous command to succeed. Chain an entry and a reduce-only exit with no pause and the exit can reach the exchange before the position exists, and get rejected. Put a short `sleep` between steps that depend on each other.

`repeat <count> (...)` runs a block several times; pace it with `sleep` inside. If any sub-command isn't recognised, the CLI aborts the whole chain, which catches a lot of typos. Running repeat and sleep tasks show up in `tasks` and in the Activity component, and you can cancel them from either.

## A Sample Setup for a Scalper

Treat this as a starting point, not a recommendation. Build it at instrument scope on one liquid market, then promote only the keys that are safe on size to global.

```cli
# session size, reset daily
set @scalp 500$
# global: jump into the CLI from anywhere
bind global ctrl+space "ui cli focus"
# entries that join the book instead of crossing it
bind b "chase buy @scalp to 0.1%"
bind s "chase sell @scalp to 0.1%"
# exits
bind c "close"
bind x "cancel"
# switch the place order form to chase
bind global ctrl+a "ui order type_chase"
# toggle reduce-only mode from the header
bind global shift+r "ui header reduce"
```

The `to 0.1%` cap means a chase gives up if price runs, so a missed entry stays missed instead of turning into a chase into the top. `close` and `cancel` live on separate keys so you can't cancel when you meant to flatten. And with reduce-only on a global key, you can lock the session to exits when you're done, so a stray entry key can't open anything new.

Once the setup is stable, run `export`. It saves binds, variables and aliases to one JSON file, and `import` brings them back on another browser or after you clear data.

## Tell Your Keys Where to Trade

With several accounts and symbols on screen, the Terminal has to know which one a key trades. Set the hotkey account and symbol from Hotkey configuration (the keyboard icon) in the top bar, or shift-click a component header to assign its ticker. We strongly recommend giving your hotkeys a link color, so you always know which venue they hit.

> **Risk note:** Test every new bind at the smallest size the exchange allows before you use real size. A bind that opens the wrong position on a leveraged account can get liquidated before you've found the mistake.

## Frequently Asked Questions

### Why does my hotkey do nothing?

Usually a text box has focus, most often the CLI input you just typed the bind into. Press TAB and try again. Then check `bind list`: the bind might be instrument-scoped while you're on a different instrument.

### Should I use instrument or global binds?

Go global for actions that mean the same thing everywhere: focusing the CLI, toggling reduce-only, closing or cancelling, and USD-sized entries. Keep unit-sized orders as instrument binds, since one unit of one asset can be worth thousands of times one unit of another.

### What is the difference between an alias and a bind?

A bind runs a command when you press a key. An alias stores a command under a name you type into the CLI. Binds are for reflexes, aliases for routines you want to trigger on purpose.

### How do I stop a repeat that is running?

Type `tasks` to see active CLI tasks and their IDs, then `kill` for the most recent one, `kill <id>` for a specific one, or `kill all`. You can also cancel repeat tasks from the Activity component.

### Can I move my setup to another computer?

Yes. `export` downloads your binds, variables and aliases as one JSON file, and `import` loads it. Export before any big change so you can roll back.
