# RelationshipTracker — Tutorial

A complete guide to setting up and using the RelationshipTracker plugin for RPG Maker MZ.

## Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Character Configuration](#character-configuration)
5. [Event Authoring](#event-authoring)
6. [The 500 Event and the Soulmate Choice](#the-500-event-and-the-soulmate-choice)
7. [Descriptions](#descriptions)
8. [Plugin Commands](#plugin-commands)
9. [Script Calls](#script-calls)
10. [State Model](#state-model)
11. [Troubleshooting](#troubleshooting)
12. [Known Limitations](#known-limitations)

---

## Overview

RelationshipTracker adds a relationship system to your RPG Maker MZ project: a "Relationships" command on the main menu, a per-character detail screen with portrait and description, and a clean event-authoring pattern for dramatic moments that fire at relationship milestones.

The model in plain language: each tracked character has a numeric **points** score and an **event-driven title** (Strangers → Acquaintances → Friends → Close Friends → Best Friends → Soulmate). Points climb as the player does things the character likes. When points cross a threshold (100, 200, 300, ...) the menu marks that character as having an event available. When the player triggers the event — either by talking to the character's NPC in the world or by selecting Play Event from the menu — they're teleported to a dedicated event map, the event plays out, and they're teleported back to where they were. The title only advances when an event actually plays, so points can sit at a threshold for as long as the player wants.

This decoupling is the point. Cross a threshold? The marker lights up. Trigger the event? The title changes and the next threshold becomes the target. Until the player actually plays the moment, nothing in the relationship status visibly progresses.

**Target:** RPG Maker MZ only. The plugin uses `PluginManager.registerCommand`, which is MZ-specific. MV is not supported.

---

## Installation

1. Copy `RelationshipTracker.js` into your project's `js/plugins/` folder.
2. Open the project in RPG Maker MZ.
3. **Tools → Plugin Manager → double-click an empty row.**
4. Pick `RelationshipTracker` from the dropdown.
5. Configure the parameters (see [Character Configuration](#character-configuration)). At minimum you'll want to add at least one character.
6. Click OK to save the plugin configuration.

That's all. The "Relationships" command will appear on the main menu directly below Status the next time the menu is opened (assuming at least one character has been met by then).

---

## Quick Start

A five-minute worked example: add a character called "Test1", give them a face, wire up one event map, and play it from the menu.

### Step 1 — Add the character entry

Plugin Manager → RelationshipTracker → double-click. Click the **Characters** field, then **Add new entry**. Fill in:

- **Key**: `test1`
- **Display Name**: `Test1`
- **Face Image**: pick any file from `img/faces` (e.g. `Actor1`)
- **Face Index**: `0` (faces are arranged 0–7, left-to-right then top-to-bottom)
- **Description**: (optional) a sentence of flavor text

Leave all the event map IDs at `0` for now. Save.

### Step 2 — Create an event map and learn its ID

In the editor's map tree (left panel), right-click an empty area and pick **New Map**. Name it "Test1 - 100 Event." After it's made, right-click it → **Edit**. The dialog title bar shows the map's ID (e.g. "ID: 005"). Remember the number.

Tip: you can also peek at the project's `data/` folder — each map is saved as `data/MapNNN.json`, where `NNN` is the ID.

### Step 3 — Wire that map back into the plugin

Plugin Manager → RelationshipTracker → Characters → edit Test1's entry → set "100-Point Event Map" to the ID from Step 2. Save.

### Step 4 — Build the event content

Open Test1's 100-Event map. Place an event at any tile, set its trigger to **Autorun**, and add:

```
◆Text: "Test1's 100-point event runs here."
◆Plugin Command: RelationshipTracker → Return From Event
```

Return From Event teleports the player back to where they were when the event was triggered. **Every event map must end with it**, or the player will be stranded on the event map.

### Step 5 — Build the meeting event (the "0 event")

On any story map, place an event the player can walk up to. Trigger: **Action Button**. Contents:

```
◆Text: "You meet Test1."
◆Plugin Command: RelationshipTracker → Meet Character
    key: test1
◆Control Self Switch: A = ON
```

Add a second event page conditioned on Self Switch A = ON, left blank, so the meeting doesn't replay.

### Step 6 — Award some points

Anywhere — chest, NPC, parallel process:

```
◆Plugin Command: RelationshipTracker → Add Points
    key:    test1
    amount: 100
```

Open the menu. Test1 now reads `Strangers — 100/100 !`.

### Step 7 — Play the event from the menu

Open the Relationships menu, pick Test1, choose **Play Event**. The player teleports to Test1's 100-Event map, the event runs, Return From Event teleports them back. Test1's title is now `Acquaintances`.

### Where to go from here

Repeat Steps 2–4 for each additional threshold (200, 300, 400, 500, 600, 700) and wire each map into the matching plugin param field. See the rest of this document for the full feature set.

---

## Character Configuration

Every character is configured through the Plugin Manager's `Characters` parameter — a list of struct entries. Add one entry per tracked character. The fields are:

### Key

A unique string identifier used everywhere the plugin references this character: plugin commands, script calls, etc. Keep it lowercase and simple (`lillith`, `ciel`, `roche`). Duplicate keys are not validated — if you accidentally create two entries with the same key, they'll silently share state.

### Display Name

The name shown in the Relationships menu and on the detail screen. Free-form — spaces and capitalization are fine. Independent of the key.

### Face Image

The faceset file from `img/faces`. The browser shows a thumbnail. Faces in MZ are 4-wide grids of 144×144 portraits.

### Face Index

Position within the faceset, 0–7. The grid is read left-to-right, top-to-bottom — so the top row of `Actor1` is indices 0, 1, 2, 3 and the row below is 4, 5, 6, 7.

If Face Image is blank, no portrait is drawn and the character's stats are positioned at the top of the profile window instead.

### 100/200/300/400/500/600/700-Point Event Map

The map ID where each threshold event lives. `0` means "no event configured for this threshold" — the marker won't appear and Play Event will refuse to fire for thresholds with no map.

You don't need to configure all seven. The plugin handles missing maps gracefully — points keep accumulating but no event plays until/unless you wire it up. This means you can ship a character with only the 100 and 200 events authored, and add the rest in a later patch.

### Description

Multiline flavor text shown in the description panel on the character's detail screen. Supports MZ text codes (see [Descriptions](#descriptions)). Optional.

---

## Event Authoring

Six event types power the system:

1. **Meeting events** ("0 events") — story-driven, run `Meet Character` to register the character
2. **Point-awarding events** — run `Add Points` to credit the character
3. **NPC events** — placed in the world, gate dialogue or trigger threshold events
4. **Threshold event maps** — dedicated maps where the relationship beats play out
5. **The 500 event** — special: where the soulmate choice happens
6. **Soulmate events (600/700)** — flavor moments unlocked only if the player chose soulmate

### Meeting events (the "0 event")

The "0 event" is the in-story moment where the player first encounters a character. It's not a dedicated event map — it's just part of your regular game flow.

Typical structure:

- Trigger: Action Button (for an NPC) or Autorun (for a cutscene)
- Show whatever dialogue or scene makes sense for the meeting
- At the very end, run `Meet Character` with the character's key
- Use a Self Switch on the event page to prevent the meeting from replaying

The character now appears in the Relationships menu as `Strangers`. Before this point, they don't appear at all.

### Awarding points

Anywhere in your game, run `Add Points` to credit a character. Points can be awarded by:

- Completing a quest the character cares about
- Choosing a dialogue option they like
- Bringing them a gift via an event
- Reaching specific story beats

Points are integers and can be negative — `Add Points (lillith, -10)` decreases the score. The total is hard-capped at the character's current cap (500 normally, 700 if they've been set as soulmate). Adding beyond the cap silently clamps.

You can also set an exact value with `Set Points`, useful when a story event should snap a relationship to a specific value rather than adjust incrementally.

### NPC events in the world

Once a character is met, they typically exist somewhere in the world as a walkable NPC. The standard pattern for their event:

- Trigger: Action Button
- First command: Conditional Branch with the script expression:

```
$gameSystem.hasPendingEvent("lillith")
```

The branch splits into two paths:

- **Branch (event pending):** Plugin Command — Play Character Event, key: `lillith`. The plugin saves the player's current position, teleports them to the next threshold event map, and advances the character's state.
- **Else branch (no event pending):** run normal dialogue, choices, sub-quest interactions — whatever fits the character.

This is the heart of the user-facing flow: the player walks up to an NPC and either gets routine dialogue or the next big relationship moment, depending on whether they've accumulated enough points.

You can also let the player launch threshold events directly from the menu via the **Play Event** command on the character's detail page. Both paths use the same underlying mechanism, so it's fine to support either or both.

### Event maps

Each threshold event lives on its own dedicated map:

1. Create a new map in the editor (note its ID).
2. Set the map's appearance and tileset however the scene calls for.
3. Place an Autorun event with the scene content.
4. **End the event with `Return From Event`.**

The Return From Event plugin command teleports the player back to where they were when the event was triggered. Always place it at the end of the event chain on every event map, or the player will be stranded.

### Fading in on event maps

The plugin teleports the player to coordinates (0, 0) facing down with `fadeType = 0` (black fade). The player arrives during the black phase — invisible until the autorun event fades the screen back in. The convention for the autorun event:

```
◆Fadeout Screen          (instant, since the screen is already black)
◆Set Movement Route:     position the player wherever the scene starts
◆Fadein Screen           (your chosen speed)
◆... scene content ...
◆Plugin Command: Return From Event
```

The redundant Fadeout Screen at the top is the MZ-recommended idiom for "hold the screen black until I'm ready." Without it, MZ's default behavior auto-fades-in shortly after the transfer, which can show a frame of the player at (0, 0) before your real positioning runs.

---

## The 500 Event and the Soulmate Choice

The 500-point event is where the relationship branches. It's a normal event map, but inside, instead of the title advancing automatically, the player chooses what happens next.

Typical structure:

```
◆Text: "Lillith looks at you, hesitant..."
◆Show Choices: "Friends" / "More than friends"
:When "Friends"
  ◆Text: "She smiles. Some things don't need to change."
:When "More than friends"
  ◆Conditional Branch: Script: $gameSystem.getCurrentSoulmate() === null
    ◆Plugin Command: Set Soulmate, key: lillith
    ◆Text: "She takes your hand..."
  :Else
    ◆Text: "She catches the look in your eyes and shakes her head."
    ◆Text: "\"There's someone else, isn't there?\""
  :End
:End
◆Plugin Command: Return From Event
```

The conditional branch around `Set Soulmate` enforces exclusivity at authoring time: only one character can be soulmate, so if another character has already been chosen, this branch falls through to a "let-down" alternative.

If the player chooses Friends (or chooses More than friends but another soulmate already exists), the character stays at Best Friends. Their cap remains 500 and the 600/700 events are unreachable.

If `Set Soulmate` runs, the character's title becomes `Soulmate`, their cap rises to 700, and the 600/700 events become reachable as points accumulate further.

### Soulmate events (600 / 700)

These are flavor moments — quiet scenes for the chosen soulmate after the big choice. Structurally identical to other event maps: autorun event, content, Return From Event at the end.

A non-soulmate character will never reach these because their cap is 500. The plugin renders `MAX` instead of a progress fraction once their points hit the cap and no further thresholds remain.

---

## Descriptions

Each character can have free-form flavor text on the right side of their detail page. Two ways to set it:

### Initial value — Plugin Manager

In the Plugin Manager's `Characters` parameter, each entry has a Description field. This is a multiline text box (press Enter inside it for a hard line break). The text typed there shows the moment the character is met.

This is the right place for static character flavor. Example:

```
\C[2]Demon, daughter of Ba'al.\C[0]
Found in the slums of Verras after the temple collapse.
```

### Runtime override — Set Description plugin command

The `Set Description` plugin command replaces the displayed text for a character. Useful when a major story beat should change how a character is described. Example: after the player learns the Queen is secretly Lillith's mother, you might run:

```
◆Plugin Command: RelationshipTracker → Set Description
    key:  lillith
    text: \C[2]Demon, daughter of Ba'al — and an angel.\C[0]
          Heir to a power neither parent claimed.
```

Passing an empty `text` clears the override, reverting the displayed text to the Plugin Manager Description.

The override is saved with the game. The Plugin Manager Description, on the other hand, is read fresh from the plugin's config every time — so editing it mid-development propagates to existing saves automatically, until a `Set Description` writes an override (which then takes precedence forever, or until cleared with an empty string).

### Text codes

Both fields support MZ's standard text codes:

| Code | Effect |
|---|---|
| `\C[n]` | Color (0–31 from the System palette) |
| `\I[n]` | Draw icon `n` inline |
| `\V[n]` | Value of variable `n` |
| `\N[n]` | Actor `n`'s database name |
| `\{` `\}` | Font-size up / down |
| `\.` | Brief pause |
| `\|` | Longer pause |
| `\!` | Wait for input |

Any custom codes registered by other plugins also work, since the description renders via MZ's `drawTextEx`.

### Auto-wrap caveat

The description window does **not** auto-wrap text on width. `drawTextEx` honors `\n` for line breaks but won't split a long line by itself. If you write a long single-line description, the right edge will spill off the panel. Insert line breaks manually.

---

## Plugin Commands

All seven plugin commands are accessed through the editor's event command picker → "Plugin Command..." → RelationshipTracker.

### Add Points

Adds (or subtracts) relationship points for one character.

- **key**: character key
- **amount**: integer, can be negative

Clamps to the current cap. Calling this on an unmet character still works — points will be there when the character is later met, though they're invisible in the menu until then.

### Set Points

Sets a character's points to an exact value (clamped to cap).

- **key**: character key
- **amount**: integer, ≥ 0

Useful for story events that should snap a relationship to a specific value rather than adjust incrementally.

### Meet Character

Registers a character as met. They now appear in the Relationships menu as `Strangers`.

- **key**: character key

Idempotent — calling this twice on the same character has no additional effect. Run at the end of the in-story meeting event.

### Play Character Event

If the character has a pending event (points ≥ next threshold and that threshold's event map is configured), this saves the player's position, advances the character's state, and teleports them to the event map.

- **key**: character key

If there's no pending event or no event map is configured for the next threshold, this is a no-op with a console warning. Typically called from an NPC event's Conditional Branch.

### Return From Event

Teleports the player back to the position saved by the most recent Play Character Event. **Place at the end of every event map.**

No arguments.

If no return point is saved (e.g. an event map autoruns without having been entered via Play Character Event), this is a no-op with a console warning.

### Set Soulmate

Marks a character as the player's soulmate. Raises their cap from 500 to 700 and sets their title to `Soulmate`.

- **key**: character key

Typically called inside the 500 event's conditional branch on the "soulmate" choice. Not automatically called by the plugin — the choice is delegated to the event author.

Soulmate exclusivity is not enforced by the plugin; gate the call with a Conditional Branch checking `$gameSystem.getCurrentSoulmate() === null`.

### Set Description

Sets a runtime description override for the character.

- **key**: character key
- **text**: multiline string, supports text codes

The override is saved with the game and persists until cleared (pass an empty string to clear, reverting to the Plugin Manager Description).

---

## Script Calls

For Conditional Branches, Control Variables expressions, or any other Script: field. All are methods on `$gameSystem`.

### Points

```js
$gameSystem.getRelationshipPoints(key)        // → number
$gameSystem.setRelationshipPoints(key, n)     // → undefined; clamps
$gameSystem.addRelationshipPoints(key, d)     // → undefined; clamps
```

### Title

```js
$gameSystem.getRelationshipTitleIndex(key)    // → 0–5
$gameSystem.getRelationshipTitleName(key)     // → "Strangers" etc., "???" if unmet
```

Backward-compat aliases (kept from v1.0.0):

```js
$gameSystem.getRelationshipTier(key)          // = getRelationshipTitleIndex
$gameSystem.getRelationshipTierName(key)      // = getRelationshipTitleName
```

### Flags

```js
$gameSystem.isMet(key)                        // → bool
$gameSystem.isSoulmate(key)                   // → bool
$gameSystem.getCurrentSoulmate()              // → key string or null
```

### Events

```js
$gameSystem.hasPendingEvent(key)              // → bool
$gameSystem.getNextEventThreshold(key)        // → number or null
$gameSystem.meetCharacter(key)                // → undefined; idempotent
$gameSystem.setSoulmate(key)                  // → undefined
```

### Description

```js
$gameSystem.getRelationshipDescription(key)            // → string
$gameSystem.setRelationshipDescription(key, text)      // → undefined
```

### Example expressions

Gate dialogue on Lillith being at least Friends (title index 2):
```js
$gameSystem.getRelationshipTitleIndex("lillith") >= 2
```

Only offer the soulmate choice if nobody else is one yet:
```js
$gameSystem.getCurrentSoulmate() === null
```

Show a special line if the player has a soulmate at all:
```js
$gameSystem.getCurrentSoulmate() !== null
```

Gate something on having met someone:
```js
$gameSystem.isMet("ciel")
```

---

## State Model

Each tracked character has independent state on `$gameSystem._relationshipData[key]`:

| Field | Type | Meaning |
|---|---|---|
| `points` | number | 0–500 normally, 0–700 if soulmate. Hard-capped. |
| `titleIndex` | number 0–5 | Current title slot. Only advances when an event plays. |
| `met` | bool | False until `Meet Character` is called. Unmet characters don't appear in the menu. |
| `isSoulmate` | bool | False until `Set Soulmate` is called. Raises the cap. |
| `nextEventThreshold` | number \| null | Points value of the next unplayed event. `null` while unmet. |
| `description` | string \| null | Runtime override for the description. `null` means use the Plugin Manager value. |

A return point also lives at `$gameSystem._relationshipReturnPoint` (mapId, x, y, direction), used by the teleport flow.

All state lives on `$gameSystem` and is saved automatically with the game. You don't need to allocate engine Variables or Switches for the plugin.

### Threshold → title mapping

When an event plays at each threshold, the title advances to:

| Threshold | Title becomes |
|---|---|
| 100 | Acquaintances |
| 200 | Friends |
| 300 | Close Friends |
| 400 | Best Friends |
| 500 | (choice — stays Best Friends, or → Soulmate via `Set Soulmate`) |
| 600 | (no change; soulmate flavor) |
| 700 | (no change; soulmate flavor) |

The 0 "event" — the in-story meeting — doesn't have a threshold-driven counterpart; it's purely story-side.

### Caps

```
Non-soulmate cap:  pointsPerTier × 5   (default: 500)
Soulmate cap:      pointsPerTier × 7   (default: 700)
```

Both are derived from the `Points Per Tier` plugin parameter, default 100. Adjust that parameter to scale the whole system — e.g. set it to 50 to halve all thresholds.

---

## Troubleshooting

### The Relationships menu command isn't showing up

Check:

- Plugin is enabled in Plugin Manager (status column shows ON).
- If you set the `Show Switch` plugin parameter to a non-zero switch ID, the menu command only appears while that switch is ON. Either turn the switch on or set `Show Switch` back to 0.

(Note: the command appears even when no character has been met — it just opens to an empty list. If the command is missing entirely, it's a config issue, not a "no characters yet" issue.)

### A character isn't appearing in the menu

The character has to be met. If you forgot to run `Meet Character` in the meeting event, they won't show up. Test by running it manually from the event command picker.

### "Play Event" doesn't appear on the detail screen

The character doesn't have a pending event. That means one of:

- Points are below the next threshold
- The next threshold's event map isn't configured (still at 0 in plugin params)
- The character has reached MAX

The detail screen shows `MAX` instead of a progress fraction when no further events are reachable.

### The marker (`!`) doesn't appear in the list

Same conditions as Play Event. Specifically, `hasPendingEvent` requires (a) met, (b) `points >= nextEventThreshold`, and (c) the corresponding event map is configured. If any one fails, no marker.

### The player gets stranded on an event map

You forgot the `Return From Event` command. Check the bottom of the autorun event on that map.

### The player appears at (0, 0) for a frame, then jumps to the real spot

The event map's autorun didn't lead with `Fadeout Screen` to hold the screen black. See [Fading in on event maps](#fading-in-on-event-maps).

### Description text spills off the right edge of the panel

The description window doesn't auto-wrap. Insert line breaks manually with Enter in the plugin parameter, or with `\n` in the `Set Description` command's text arg.

### Console warnings

The plugin emits warnings (visible in the developer console — F8 in playtest) for predictable error conditions. All are prefixed with `RelationshipTracker:` so they're easy to filter for.

- `meetCharacter called with unknown key "X"` — typo in the key, or the character entry isn't configured
- `setSoulmate called on unmet character "X"` — you tried to set soulmate before meeting them
- `setSoulmate called with unknown key "X"` — key typo
- `setDescription called with unknown key "X"` — key typo
- `triggerCharacterEvent called for "X" but no event is pending` — Play Character Event ran when no event was pending (usually a Conditional Branch mistake)
- `no event map configured for "X" at threshold N` — Play Character Event ran for a threshold with no map ID
- `returnFromEvent called but no return point saved` — Return From Event ran without a corresponding Play Character Event having queued the return

### Save compatibility

The plugin's state lives on `$gameSystem`, so it's saved automatically. Loading a save from before the plugin was installed works fine — characters start as unmet with zero points. Loading a save from an older plugin version (v2.0 or v2.1) into v2.2 also works — the new description field is backfilled lazily.

---

## Known Limitations

These are intentional design choices or known caveats, not bugs:

- **Soulmate exclusivity is event-author-enforced.** Calling `Set Soulmate` on a second character marks both as soulmate. Use the Conditional Branch pattern in [The 500 Event](#the-500-event-and-the-soulmate-choice) to prevent it.
- **Teleport entry point is (0, 0) facing down.** Author each event map to reposition the player as the first thing it does.
- **No portrait fallback.** If `faceName` is blank or the file is missing, the portrait area is empty (the stats slide up to occupy the space). No silhouette or placeholder.
- **Empty character list shows a blank menu.** No "no characters configured" placeholder text.
- **Duplicate keys are silent.** Don't reuse keys.
- **No navigation between characters within the detail screen.** Back to the list, then pick another.
- **Description does not auto-wrap on width.** Insert line breaks manually with Enter.
- **MV not supported.** MZ only — the plugin uses MZ-specific APIs.
