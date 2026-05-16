# RelationshipTracker Tutorial

A first-time-use guide for the RelationshipTracker MZ plugin (v2.4-stable).

This tutorial walks through wiring up a single character end-to-end, then
points to the other features once you have a working baseline.

## What this plugin does

Adds a "Relationships" command to the main menu (directly below Status).
Each character you register has:

- A relationship score (points 0–500, or 0–700 if they become your
  Soulmate).
- A current title ("Strangers" → "Acquaintances" → "Friends" →
  "Close Friends" → "Best Friends" → "Soulmate").
- A set of dedicated event maps that play when the player crosses
  thresholds (100, 200, 300, 400, 500, 600, 700 points).
- A description page, a face portrait, a progress gauge, rank pips,
  and an optional Soulmate styling.

Titles only advance when an event plays — never just from points
crossing a threshold. This is intentional: it gives you a "you have
an event waiting" beat in the menu instead of an automatic level-up.

## Step 1 — Install the plugin

1. Drop `RelationshipTracker.js` into your project's `js/plugins/`
   folder.
2. Open the Plugin Manager (F10 in the editor, or Tools → Plugin Manager).
3. Add a new entry, pick `RelationshipTracker` from the list, and
   enable it.
4. Save your project.

## Step 2 — Configure your first character

Double-click the plugin entry to open its parameter editor.

1. Click the **Characters** field → "Add new entry".
2. Fill in:
   - **Key**: `test1` (lowercase, no spaces — this is how you'll
     reference the character in plugin commands).
   - **Display Name**: `Test1` (what the player sees).
   - **Face Image**: pick any file from `img/faces` (or leave blank
     — the plugin falls back to `Actor1` at index 0).
   - **Face Index**: `0` (positions 0–7 on the face sheet, left to
     right then top to bottom).
   - **Description**: optional flavor text shown on the character's
     detail page. Supports text codes (`\C[n]` color, `\I[n]` icon,
     `\V[n]` variable, `\N[n]` actor name, etc.) and newlines.
3. Leave the **Event Map** fields at `0` for now — we'll wire one up
   in Step 5.
4. Save the plugin params.

## Step 3 — Build the "meet" event

Every character needs a "first meeting" event somewhere in your story
to make them appear in the Relationships menu. Without this step,
the character is hidden — they exist in the param list but the menu
doesn't show them.

1. On any map, place an event the player can interact with (NPC
   sprite, item, etc.). Set the trigger to **Action Button**.
2. In the event's command list:
   - **Text**: "You meet Test1." (or whatever flavor you want)
   - **Plugin Command**: `RelationshipTracker → Meet Character`
     - `key`: `test1`
   - **Control Self Switch**: A = ON
3. Add a second event page conditioned on `Self Switch A = ON`, leave
   it empty. This prevents the meeting from repeating.

Now in your test playthrough, walk up to that event and interact.
Open the menu → Relationships. `Test1` should appear as "Strangers".

## Step 4 — Award some points

You can give points anywhere — chests, NPCs, parallel processes,
post-battle hooks, etc.

The easiest place to test: place a new event with trigger Action
Button, contents:

- **Plugin Command**: `RelationshipTracker → Add Points`
  - `key`: `test1`
  - `amount`: `100`

Walk up to it and interact. Open the Relationships menu — Test1 now
reads "Strangers — 100/100 (filled gauge) !". The `!` marker means
an event is pending. They're still "Strangers" because the title
only advances when the event plays (Step 7).

## Step 5 — Create the event map

This is the map the player gets teleported to when their 100-point
event triggers.

1. In the editor's map tree (left panel), right-click and pick
   "New Map".
2. Name it "Test1 - 100 Event" (or anything you'll recognize).
3. After it's created, right-click → Edit. The dialog title shows
   the map's ID (e.g. "ID: 005"). Remember that number — you'll wire
   it back into the plugin in Step 6.

(Quick tip: each map is saved as `data/MapNNN.json`, where NNN is
the ID. If you ever lose track, peek in that folder.)

## Step 6 — Wire the event map into the plugin

Open the plugin params again. Edit Test1's character entry. Set:

- **100-Point Event Map**: `5` (or whatever ID you got in Step 5).
- **100-Point Event Spawn X**: where you want the player to appear
  on that map. Default `0`.
- **100-Point Event Spawn Y**: same. Default `0`.
- **100-Point Event Spawn Direction**: which way the player faces
  after the teleport. Default `Down`.

Save.

## Step 7 — Build the event content

Open Test1's event map and place an event somewhere visible. Set
the trigger to **Autorun**, and add:

- **Text**: "Test1's 100-point event plays here."
- **Plugin Command**: `RelationshipTracker → Return From Event`
- **Control Self Switch**: A = ON

Then add a second event page conditioned on `Self Switch A = ON`,
left blank. This is critical — without it, the autorun would
re-trigger every frame before `Return From Event` can fire (causing
an infinite loop).

`Return From Event` teleports the player back to where they were
before the event, fires the tier-up SE/message if a title advance
just happened, and clears the return point.

## Step 8 — Play it from the menu

In your test playthrough:

1. Open menu → Relationships → pick Test1.
2. The detail page shows their face, description, progress, and a
   "Play Event" command (because an event is pending at this
   threshold).
3. Pick Play Event. The plugin saves your position, teleports you to
   Test1's 100-Event map at the spawn point you configured, plays
   the autorun, then teleports you back.
4. After the return, Test1's title is now "Acquaintances".

That's the full loop. To add more events, repeat Steps 5–6 for each
threshold (200, 300, 400, 500, 600, 700), wiring each new map's ID
+ spawn point into the matching plugin param fields.

## About the 500 event (the Soulmate choice)

The 500 event is special — it's where the player decides whether
this character becomes Soulmate (raising their cap to 700 with two
extra events at 600 and 700) or stays at Best Friends. Inside the
500 event map's autorun, use a Show Choices command:

- "Best Friend forever" — just continue.
- "More than friends" — gate with a Conditional Branch checking the
  script expression `$gameSystem.getCurrentSoulmate() === null` (so
  the player can't pick two Soulmates), then run the Plugin Command
  `RelationshipTracker → Set Soulmate` with `key: test1`.

End the event with `Return From Event` as usual.

If you want polyamory routes where multiple characters can be
Soulmate simultaneously, flip the **Allow Multiple Soulmates** plugin
param to ON. The exclusivity check is then skipped entirely.

## NPC events that use pending state

A common pattern: an NPC of the character is on a world map, and
their interaction either runs the pending event (if available) or
runs normal dialogue (if not).

Place an event on the world map with trigger Action Button. Use a
Conditional Branch with the script expression:

```
$gameSystem.hasPendingEvent("test1")
```

- If true: `Plugin Command: Play Character Event` with `key: test1`.
- Else (the branch's Else): your normal NPC dialogue.

## Other features at a glance

**Description text codes.** Descriptions support `\C[n]` (color),
`\I[n]` (inline icon), `\V[n]` (variable), `\N[n]` (actor name), and
all of MZ's other standard text codes. Text wraps automatically at
the panel's width.

**Runtime description changes.** Plugin Command `Set Description`
replaces the description for a character mid-game — useful for plot
beats. Pass an empty string to clear the override (the menu reverts
to the plugin-param description).

**Tier-Up Notification.** Configure the Tier-Up SE, SE Volume, and
Message plugin params to get a Persona-style notification when a
character's title actually changes. Fires after the event content
plays, before the transfer back. Set Tier-Up Message to blank to
disable the message; leave the SE blank to disable the sound.

**Threshold-Crossed Toast.** When a character's points first cross a
threshold with an event configured, a small notification window
slides in (bottom-right by default). One-shot per character per
threshold — won't re-fire across save/load. Configure via the
Toast plugin params:

- **Toast Position**: which screen corner.
- **Toast Show Face**: face thumbnail on/off.
- **Toast Margin X / Y**: distance from the corner in pixels.
- **Toast Width / Dwell Frames**: window size and how long it holds.
- **Toast SE / Volume**: optional sound on appearance.
- **Toast Enabled**: master switch.

**Empty State Message.** Shown in the Relationships list when no
characters have been met yet. Configure via the **Empty State
Message** plugin param. Leave blank to render a fully empty list.

**Detail Scene Navigation.** Inside a character's detail page,
PgUp/PgDn (Q/W on keyboard, L1/R1 on gamepad) and Cursor Left/Right
cycle to the next/previous met character without backing out to the
list. Cycling wraps around.

**Portrait Fallback.** Characters with no Face Image configured
display Actor1 at face index 0 (the default starter face). Applies
in both the profile and the toast.

**Progress Gauge & Rank Pips.** Each character's detail page shows a
filled bar for within-tier progress and a row of pips marking
completed events. The bar fill color is configurable via the
**Gauge Color** plugin param.

**Soulmate Styling.** Once a character is set as Soulmate, their
name shows in the configured Soulmate Color with a ♥ appended, in
both the list and detail page. Color is a System palette index (0–31)
configured via the **Soulmate Color** plugin param.

## Script-call API

These all live on `$gameSystem` and can be called from script
expressions in Conditional Branches, Control Variables (Script), etc.:

- `getRelationshipPoints(key)` / `setRelationshipPoints(key, n)` /
  `addRelationshipPoints(key, delta)`
- `getRelationshipTitleIndex(key)` (0–5)
- `getRelationshipTitleName(key)` (returns `"???"` if unmet)
- `isMet(key)` / `isSoulmate(key)`
- `getCurrentSoulmate()` (key or `null`)
- `getAllSoulmates()` (array of keys; useful with Allow Multiple
  Soulmates ON)
- `hasPendingEvent(key)` (true iff met, points ≥ next threshold,
  and the event map ID is configured)
- `getNextEventThreshold(key)` (number or null)
- `getRelationshipDescription(key)` (string)
- `meetCharacter(key)` / `setSoulmate(key)` /
  `setRelationshipDescription(key, text)` (same as plugin commands)

## Common gotchas

**The autorun + Self Switch pattern is required.** Every event map's
autorun must end with `Control Self Switch A = ON` plus a blank Page 2
conditioned on it. Without that, the autorun re-triggers every frame
before `Return From Event` can fire — infinite loop.

**Meet Character is idempotent but you still have to call it.** A
character won't appear in the menu until `Meet Character` runs at
least once. Calling it again does nothing (no state regression).

**The 500 event is where the Soulmate choice lives.** Don't call
`Set Soulmate` from anywhere else unless you've thought through the
flow — the tier-up notification fires from `Return From Event`, and
a `Set Soulmate` call outside that paradigm won't trigger the SE +
message.

**Keys are case-sensitive and exact.** `"test1"` and `"Test1"` are
different. Duplicate keys in the Characters list silently share state.

**Saves preserve descriptions, soulmate flags, toast-seen sets, and
return points.** A save made mid-event-map will still play the
tier-up notification on `Return From Event` after loading.

## Where to go from here

- Build out the rest of `test1`'s event chain (200, 300, 400 events).
- Configure the 500 event with the Soulmate choice.
- Add more characters via the Characters param.
- Tune the Toast, Tier-Up, Gauge, and Soulmate styling params to
  taste.
- Read the plugin's `@help` block (in the Plugin Manager) for the
  architecture notes and edge-case documentation.
