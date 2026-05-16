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
8. [Soulmate Styling](#soulmate-styling)
9. [Tier-Up Notification](#tier-up-notification)
10. [Threshold-Crossed Toast](#threshold-crossed-toast)
11. [Progress Gauge and Rank Pips](#progress-gauge-and-rank-pips)
12. [Multiple Soulmates](#multiple-soulmates)
13. [Empty State Message](#empty-state-message)
14. [Detail Scene Navigation](#detail-scene-navigation)
15. [Portrait Fallback](#portrait-fallback)
16. [Plugin Commands](#plugin-commands)
17. [Script Calls](#script-calls)
18. [State Model](#state-model)
19. [Troubleshooting](#troubleshooting)
20. [Known Limitations](#known-limitations)

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

(Each event map also has three optional fields — Spawn X, Spawn Y, and Spawn Direction — that control where the player appears on the event map. The defaults (0, 0, Down) are fine for now. See [Per-event spawn points](#per-event-spawn-points) under Character Configuration for details.)

### Step 4 — Build the event content

Open Test1's 100-Event map. Place an event at any tile, set its trigger to **Autorun**, and add:

```
◆Text: "Test1's 100-point event runs here."
◆Plugin Command: RelationshipTracker → Return From Event
◆Control Self Switch: A = ON
```

Then add a **second event page** to the same event, with no commands, and condition it on **Self Switch A = ON**.

Why the self switch: autorun events re-trigger every frame as long as their page conditions hold. `Return From Event` reserves a transfer, but the autorun would restart before the transfer fires — infinite loop. The self switch toggle plus blank Page 2 lets the autorun fire exactly once, then go silent so the transfer can complete. This pattern is required on **every** event map.

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

If Face Image is blank, the plugin substitutes Actor1 at face index 0 — the default starter face every MZ project ships with — so the profile and toast still render cleanly. See [Portrait Fallback](#portrait-fallback) for details.

### 100/200/300/400/500/600/700-Point Event Map

The map ID where each threshold event lives. `0` means "no event configured for this threshold" — the marker won't appear and Play Event will refuse to fire for thresholds with no map.

You don't need to configure all seven. The plugin handles missing maps gracefully — points keep accumulating but no event plays until/unless you wire it up. This means you can ship a character with only the 100 and 200 events authored, and add the rest in a later patch.

### Per-event spawn points

Each threshold's event map has three additional fields controlling where the player lands on that map:

- **NNN-Point Event Spawn X** — tile X coordinate. Default `0`.
- **NNN-Point Event Spawn Y** — tile Y coordinate. Default `0`.
- **NNN-Point Event Spawn Direction** — facing direction after teleport: Down, Left, Right, or Up. Default `Down`.

The defaults reproduce the legacy behavior of teleporting to (0, 0) facing down, so a character configured before these fields existed still works without changes. The fields exist so you can place the player at a specific entry tile per event — useful when an event map has a fixed "doorway" tile, or when different threshold events on the same map should drop the player in different places.

You can still override positioning via the autorun event on the event map (see [Fading in on event maps](#fading-in-on-event-maps)) if you need positioning to depend on dynamic story state. The spawn point fields just give you a sensible default landing spot.

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
4. **End the event chain with `Return From Event`, then `Control Self Switch: A = ON`.**
5. **Add a blank second event page conditioned on Self Switch A = ON.**

The Return From Event plugin command teleports the player back to where they were when the event was triggered. Always place it near the end of the event chain on every event map, or the player will be stranded.

The self-switch toggle plus blank Page 2 is the MZ-idiomatic way to make an autorun fire exactly once. Without it, the autorun re-triggers every frame, which prevents `Return From Event`'s reserved transfer from ever executing — the player is stuck in an infinite loop of the autorun restarting. This pattern is required on every event map; the plugin can't absorb it without deviating from MZ conventions in ways that could conflict with other plugins.

The order **Return From Event → Control Self Switch** matters less in practice (both run in the same frame and the transfer fires only after the autorun terminates), but putting Return From Event first keeps the "this is the last meaningful thing the event does" reading intact.

### Fading in on event maps

The plugin teleports the player to the spawn point you configured on the Character struct (X, Y, Direction — see [Per-event spawn points](#per-event-spawn-points)), with `fadeType = 0` (black fade). The player arrives during the black phase — invisible until the autorun event fades the screen back in.

If your event map has a fixed entry layout, just set the spawn point fields once in the plugin params and let the autorun start with `Fadein Screen`:

```
◆Fadein Screen           (your chosen speed)
◆... scene content ...
◆Plugin Command: Return From Event
```

If you need entry positioning to vary based on story state, or if you want a held-black moment before the scene begins, override the spawn-point default with an in-autorun reposition. The MZ-idiomatic pattern is:

```
◆Fadeout Screen          (instant, since the screen is already black)
◆Set Movement Route:     position the player wherever the scene starts
◆Fadein Screen           (your chosen speed)
◆... scene content ...
◆Plugin Command: Return From Event
```

The redundant Fadeout Screen at the top is the MZ-recommended idiom for "hold the screen black until I'm ready." It's only necessary when you're repositioning the player inside the autorun — if you're relying on the configured spawn point, you can skip it.

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
◆Control Self Switch: A = ON
```

(And as with all event maps, a blank Page 2 conditioned on Self Switch A = ON.)

**On soulmate exclusivity.** The conditional branch around `Set Soulmate` is the recommended UX pattern. Since v2.3, the plugin itself also enforces exclusivity — a `Set Soulmate` call on a second character is silently refused with a console warning. The conditional branch in your event handles the narrative side: instead of nothing happening when a player tries to pick a second soulmate, they see a coherent "someone else already" branch.

If the player chooses Friends (or chooses More than friends but another soulmate already exists), the character stays at Best Friends. Their cap remains 500 and the 600/700 events are unreachable.

If `Set Soulmate` runs, the character's title becomes `Soulmate`, their cap rises to 700, and the 600/700 events become reachable as points accumulate further.

### Soulmate events (600 / 700)

These are flavor moments — quiet scenes for the chosen soulmate after the big choice. Structurally identical to other event maps: autorun event, content, Return From Event, Control Self Switch A = ON, blank Page 2.

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

### Auto-wrap (v2.4)

The description window auto-wraps text on width: long single lines break at word boundaries to fit the panel. Text codes (`\C[n]`, `\I[n]`, `\V[n]`, `\N[n]`, etc.) are preserved across line breaks. Explicit `\n` in your text is still honored as a forced break. If the wrapped text exceeds the window's height, lines below the bottom edge clip silently (no internal scrolling).

Variable substitutions (`\V[n]`) and actor name substitutions (`\N[n]`) are expanded before measurement, so wrap layout reflects the actual displayed width. Icons (`\I[n]`) are treated as 32px-wide atoms for wrap purposes.

---

## Soulmate Styling

Once a character has been set as soulmate (via the `Set Soulmate` plugin command, typically inside the 500 event), their display name renders in a configurable color with a `♥` appended. This styling applies in both the relationship list and the detail page's profile panel.

The color is controlled by the **Soulmate Color** plugin parameter — a System palette index from 0 to 31. The default is 3 (green). To pick a different color, open the editor's Database → System tab → Window image to see the 32-color palette, and use the index that corresponds to the color you want.

Common indices:

| Index | Color |
|---|---|
| 0 | White (default text) |
| 1 | Blue |
| 2 | Red |
| 3 | Green (plugin default) |
| 4 | Cyan |
| 6 | Yellow |
| 14 | Pink |
| 17 | Light blue |
| 24 | Orange |

The styling applies the moment `Set Soulmate` runs. There's no need to refresh the menu manually — the next time the player opens it, the soulmate's name renders styled.

---

## Tier-Up Notification

When a character's title actually changes — when an event below the 500-point threshold plays, or when `Set Soulmate` runs inside the 500 event — the plugin can play a sound effect and display a message. The notification is timed Persona-style: it fires at the **end** of the event content, just before the player returns to the world.

The exact sequence:

1. Event content plays on the event map (your dialogue, scene beats, etc.).
2. The autorun event reaches the `Return From Event` plugin command.
3. The tier-up SE plays. The tier-up message queues for display.
4. The message appears in MZ's standard text window. The player advances past it with the action button (the same way they dismiss any dialogue).
5. The player transfers back to where they triggered the event.

If the player saves the game inside the event map and reloads later, the pending tier-up is preserved — when they reach Return From Event, the notification still fires.

### Configuration

Three plugin parameters control this:

**Tier-Up SE** — a sound effect file from `audio/se`. The Plugin Manager gives you a file picker. Leave blank to disable the sound entirely. Good choices for an upgrade stinger include the default MZ SEs like `Item3`, `Skill3`, or `Heal4`.

**Tier-Up SE Volume** — 0 to 100. Default 90.

**Tier-Up Message** — the text shown by the notification. Supports two placeholders:
- `%1` is replaced with the character's display name
- `%2` is replaced with the new title

Default: `"%1 is now %2."` — which produces output like `Lillith is now Friends.` or `Ciel is now Soulmate.`

Leave the message field blank to suppress the text and play only the SE.

### When the notification does and doesn't fire

The notification fires when a title actually changes. That means:

| Event | Notification? |
|---|---|
| 100, 200, 300, 400 event plays | Yes — title advances |
| 500 event with `Set Soulmate` | Yes — title becomes Soulmate |
| 500 event without `Set Soulmate` | No — title stays Best Friends |
| 500 event where `Set Soulmate` was refused (someone else is already soulmate) | No — no state change |
| 600, 700 event plays | No — title is already Soulmate |

### A note on manual `Set Soulmate` calls

The notification only fires when the event-launch flow (Play Character Event → event map → Return From Event) is in play. If you call `Set Soulmate` from a context that doesn't go through Return From Event — e.g., a standalone cutscene event in the world — the title change happens silently. In practice this isn't a problem because soulmate is supposed to be set inside the 500 event. If you need to grant soulmate status from somewhere else and you want feedback, play the SE manually and show a message yourself.

---

## Threshold-Crossed Toast

When a character's points first cross a threshold with an event configured, the plugin shows a notification window with the character's face and a configurable line of text. Think of it as "this character has something new to talk about" — the player gets a heads-up that an event is now available without having to open the menu.

By default the toast appears in the bottom-right corner of the screen; you can anchor it to any of the four corners via plugin parameter.

The toast is **one-shot per character per threshold**. Once shown for a given milestone, it never re-appears for that same milestone, even across save/load cycles. Each character carries a `toastsSeen` list internally that tracks which thresholds have already toasted.

### When it fires

The toast queues when `hasPendingEvent` flips from false to true for a character. That happens when any of these mutate the state:

- **Add Points / Set Points** that push a character's points up to or past their next threshold (with an event map configured for that threshold).
- **Meet Character** when the character had points pre-awarded before the meeting event.
- **Set Soulmate** raising the cap, which can unlock the 600 threshold for a character whose points already qualify.
- **Play Character Event** advancing the next threshold past a character whose points already qualify — i.e., the "200/100" case where a character is so far past their next event that playing it immediately puts them at the next one.

### Visual and configuration

The toast renders as a window with the character's face (scaled to 72×72) on the left and the configured message text on the right. The message supports plain text only — no MZ text codes — and word-wraps automatically; the window's height grows to fit wrapped lines.

The face thumbnail is optional. With **Toast Show Face** turned off, the face area is omitted entirely and the text fills the full window width.

Plugin parameters that control the toast:

| Parameter | Default | Purpose |
|---|---|---|
| Toast Enabled | ON | Master switch. Turn off to suppress all toasts. |
| Toast Message | `"You and %1 are ready to have a talk."` | The text. `%1` is replaced with the character's display name. |
| Toast Width | 480 | Window width in pixels. Wider = less wrap. |
| Toast Position | Bottom-Right | Which screen corner the toast anchors to. Options: Top-Left, Top-Right, Bottom-Left, Bottom-Right. |
| Toast Show Face | ON | Whether to draw the character's face thumbnail on the left side. Off = text uses full window width. |
| Toast Margin X | 24 | Horizontal distance in pixels from the anchored corner. |
| Toast Margin Y | 24 | Vertical distance in pixels from the anchored corner. |
| Toast Dwell Frames | 150 | How long the toast stays fully visible (60 = ~1 second at default framerate). |
| Toast SE | (blank) | Sound effect file from `audio/se` played when a toast appears. |
| Toast SE Volume | 90 | Volume (0–100) for the toast SE. |

Fade-in and fade-out durations (15 and 30 frames respectively) are hardcoded.

For top-anchored toasts (Top-Left, Top-Right), multi-line wrapped text grows downward from the top edge. For bottom-anchored toasts, multi-line wrap grows upward from the bottom edge. The chosen corner anchor stays at the same screen position across toasts of varying line counts.

### Suppression and queueing

Toasts don't display in inappropriate contexts. The suppression checks:

- A message window is active (`$gameMessage.isBusy()` is true).
- An event is running (`$gameMap.isEventRunning()` is true).
- The player is currently on a relationship event map (`$gameSystem.getReturnPoint()` is non-null).
- A map transfer is pending (`$gamePlayer.isTransferring()` is true).

A toast that would have fired during any of these holds in the queue. When the blocking condition clears (the message dismisses, the event ends, the player completes a return-from-event transfer, or any map transfer finishes), the toast spawns on the next frame.

Multiple toasts queue serially — if two characters hit their threshold in the same point award, you'll see one toast play its full lifecycle, then the next.

The queue lives on `$gameSystem._toastQueue` and survives saves, so a toast queued mid-cutscene will still surface after a save/load.

---

## Progress Gauge and Rank Pips

The relationship list and detail screen show two complementary visualizations of progress.

### Progress Gauge

A filled horizontal bar showing within-tier progress — how close the character is to their next event. The number is centered on the bar with a 1px drop shadow for readability against both filled and empty fill states.

- **List view:** compact gauge (120×12) right of the title text in each row.
- **Detail view:** wider gauge (up to 200×18) beside the "Progress:" label in the profile window.
- **At MAX:** the bar shows fully filled with "MAX" centered over it. (MAX means no further events are reachable — non-soulmate after the 500 event, soulmate after the 700 event.)

The fill color is the **Gauge Color** plugin parameter — a System palette index. Default is 23 (gold). The backdrop uses MZ's standard `gaugeBackColor`.

### Rank Pips

A row of circles in the detail view, one per reachable event threshold. Filled circles (●) mark events that have played; empty circles (○) mark events the player has yet to trigger.

- **Non-soulmate characters** show 5 pips (for events at 100/200/300/400/500).
- **Soulmate characters** show 7 pips (adding 600 and 700).

A pip "fills" once the corresponding event runs and the title advances past that threshold. Filled pips use the Gauge Color; empty pips use a dimmer color (gauge backdrop) for contrast.

Pip size adapts to the available width. With 5 pips and a 360px profile window, pips render large. With 7 pips, they shrink slightly to fit on one line. Clamped between baseFontSize and baseFontSize+8 so they never look microscopic or oversized.

---

## Multiple Soulmates

By default (as of v2.3), only one character can be soulmate at a time. `Set Soulmate` refuses to assign a second one with a console warning, leaving the existing soulmate unchanged.

For games that want polyamory routes or other designs where multiple soulmates are valid, set the **Allow Multiple Soulmates** plugin parameter to ON. The exclusivity check is skipped entirely; `Set Soulmate` accepts any character that has been met.

With multiple soulmates enabled:

- `getCurrentSoulmate()` still returns only one key (the first match in iteration order). For complete enumeration, use `getAllSoulmates()`, which returns an array of all current soulmate keys.
- Each soulmate gets their own styled name (with `♥`) in the menu, independently.
- Each soulmate's cap is raised to 700 individually — their 600/700 thresholds become reachable.
- The exclusivity console warning is suppressed since the check is no longer running.

Note: the recommended `getCurrentSoulmate() === null` conditional pattern inside 500 events no longer applies if multiple soulmates are allowed. Adjust your 500 event branching accordingly — for example, you might let any character be assigned soulmate regardless of who else is.

---

## Empty State Message

When the player opens the Relationships menu before meeting any characters, the list would otherwise render as a blank box. The **Empty State Message** plugin parameter sets placeholder text that appears centered in the list when no characters have been met yet.

Default: `"You haven't met anyone yet."`

Customize via Plugin Manager → RelationshipTracker → Empty State Message. The text is plain — no MZ text codes — and renders on a single line centered vertically in the list window. To suppress the placeholder and revert to the older blank-list behavior, set the parameter to an empty string.

The message disappears the moment the first character is met, so once your story's first meeting event runs, the player won't see it again unless they somehow lose all met characters (which the plugin doesn't support — there's no "unmeet" operation).

---

## Detail Scene Navigation

Inside a character's detail page, the player can cycle between met characters without backing out to the list. The next/previous character is bound to two key sets:

- **PgUp / PgDn** (Q / W on keyboard, L1 / R1 on a gamepad) — MZ's convention for cycling actors in the Status and Equip scenes.
- **Cursor Left / Right** (arrow keys, D-pad).

Both key sets are bound, so the player can use whichever they prefer.

Cycling wraps around. Pressing "next" on the last met character jumps to the first, and pressing "previous" on the first jumps to the last. With only one character met, the input is a no-op (no sound, no flicker).

The window contents update in place — no scene push/pop, no fade. The profile, description, and command list all refresh to show the newly-selected character. "Play Event" appears or hides based on the newly-shown character's pending state, and the cursor resets to the first command so the player isn't pointing at an option that no longer exists.

A cursor sound effect plays on each successful cycle for audio feedback.

---

## Portrait Fallback

Characters configured without a Face Image fall back to Actor1 at face index 0 — the default starter face that ships with every MZ project. The fallback applies in both the detail-scene profile and the threshold-crossed toast, so a character configured without art still renders cleanly during development and won't leave a blank space in the UI.

The fallback is applied at plugin load time, so all downstream renderers see a valid faceset reference. If you delete `img/faces/Actor1.png` from your project, the fallback will silently fail to load for those characters (their portrait area renders empty). Don't delete the default Actor1 face unless you've configured every character with an explicit face.

To opt out of the fallback for a specific character — for example, you want the profile to render with no portrait area — you'd need to author a custom blank facest and reference it explicitly. There's no plugin parameter to disable the fallback globally; it's baked into the character-parsing step.

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

Marks a character as the player's soulmate. Raises their cap from 500 to 700 and sets their title to `Soulmate`. Also fires the tier-up notification (SE + message) when the next `Return From Event` runs.

- **key**: character key

Typically called inside the 500 event's conditional branch on the "soulmate" choice.

**Exclusivity is enforced.** If another character is already the soulmate, this call is silently refused with a console warning — no state change. Calling on the same character who is already soulmate is a silent no-op. The author-side `$gameSystem.getCurrentSoulmate() === null` conditional is still recommended so the player sees a "someone else already" branch rather than a silent refusal.

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
$gameSystem.getAllSoulmates()                 // → array of soulmate keys (typically 0 or 1; multiple if Allow Multiple Soulmates is ON)
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
| `toastsSeen` | array of numbers | Threshold values where the toast has already fired for this character. Used to prevent re-toasting the same milestone across save/load. (Added v2.4.) |

Two additional pieces of system-wide state:

- `$gameSystem._relationshipReturnPoint` — `{mapId, x, y, direction}` or `null`. Set by `Play Character Event` for the round-trip back.
- `$gameSystem._toastQueue` — array of `{key}` entries for toasts awaiting display. Persists across saves so toasts queued mid-event still surface on return. (Added v2.4.)
- `$gameSystem._pendingTierUpNotification` — `{displayName, titleName}` or `null`. Set when a title advances, consumed by `Return From Event` to play the SE and queue the message. (Added v2.3.)

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

You're using an in-autorun `Set Movement Route` to position the player, but the event map's autorun didn't lead with `Fadeout Screen` to hold the screen black. Either start the autorun with `Fadeout Screen` to keep the screen black during your positioning (see [Fading in on event maps](#fading-in-on-event-maps)), or — usually simpler — set the event map's Spawn X / Spawn Y / Spawn Direction fields in the Character struct so the plugin's initial teleport puts the player at the right spot to begin with.

### Description text spills off the right edge of the panel

As of v2.4, the description window auto-wraps text on width. If you're seeing overflow:

- Check that the line of text doesn't contain a single unbreakable run (e.g., a URL or long compound word with no spaces) — wrap can't split inside an unbreakable token, so it'll overflow rather than infinite-loop.
- Check whether the description is taller than the window. The window clips silently at the bottom edge; text past that limit just doesn't render. Shorten the description or widen the panel.

### Console warnings

The plugin emits warnings (visible in the developer console — F8 in playtest) for predictable error conditions. All are prefixed with `RelationshipTracker:` so they're easy to filter for.

- `meetCharacter called with unknown key "X"` — typo in the key, or the character entry isn't configured
- `setSoulmate called on unmet character "X"` — you tried to set soulmate before meeting them
- `setSoulmate called with unknown key "X"` — key typo
- `setSoulmate refused for "X" — "Y" is already soulmate` — exclusivity blocked a second-soulmate assignment. Either intentional (your conditional branch is working) or a bug in your branching logic.
- `setDescription called with unknown key "X"` — key typo
- `triggerCharacterEvent called for "X" but no event is pending` — Play Character Event ran when no event was pending (usually a Conditional Branch mistake)
- `no event map configured for "X" at threshold N` — Play Character Event ran for a threshold with no map ID
- `returnFromEvent called but no return point saved` — Return From Event ran without a corresponding Play Character Event having queued the return

### Save compatibility

The plugin's state lives on `$gameSystem`, so it's saved automatically. Loading a save from before the plugin was installed works fine — characters start as unmet with zero points. Loading a save from an older plugin version (v2.0/v2.1/v2.2) into v2.3 also works — newer fields are backfilled lazily as they're accessed.

---

## Known Limitations

These are intentional design choices or known caveats, not bugs:

- **Autorun event maps need a Self Switch toggle.** Without `Control Self Switch A = ON` plus a blank Page 2 conditioned on it, autoruns re-trigger every frame before the Return From Event transfer can fire. See [Event maps](#event-maps).
- **Duplicate keys are silent.** Don't reuse keys in the Characters parameter — duplicate entries silently share state.
- **Tier-up notification only fires through the event-map flow.** A manual `Set Soulmate` call outside a Play Character Event → Return From Event pairing won't fire the SE or message. See [Tier-Up Notification](#tier-up-notification).
- **Description wrap clips at window height.** Wrapped text taller than the description panel renders only the lines that fit; the rest is clipped silently. No scrolling.
- **Toast supports plain text only.** Toast messages don't support MZ text codes — only `%1` substitution and word-wrap. (Descriptions still support full text codes.)
- **Toast position is fixed during runtime.** The position is read once at plugin load. To change which corner toasts appear in mid-game, you'd need to reload the plugin (which generally requires a restart in MZ).
- **No global portrait-fallback opt-out.** Characters with no Face Image always fall back to Actor1[0]. To render a character with no portrait, configure them with a blank or transparent custom facest file.
- **MV not supported.** MZ only — the plugin uses MZ-specific APIs.
