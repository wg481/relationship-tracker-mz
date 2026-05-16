//=============================================================================
// RelationshipTracker.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc v2.4-stable Relationship tracker with event maps, toasts, soulmate progression, and per-event spawn points.
 * @author wg481 (Massimo Russell)
 *
 * Copyright 2026 wg481 (Massimo Russell). Developed with AI assistance
 * from Anthropic's Claude. Licensed under the Apache License, Version 2.0,
 * with additional terms requiring visible attribution in any product
 * that incorporates this Work. See the LICENSE file distributed with this
 * plugin for the full terms. A summary appears in the License section at
 * the bottom of this @help block.
 *
 * @param menuCommandLabel
 * @text Menu Command Label
 * @type string
 * @desc Text shown for the new command in the main menu.
 * @default Relationships
 *
 * @param emptyStateMessage
 * @text Empty State Message
 * @type string
 * @desc Text shown in the Relationships list when no characters have been met yet. Leave blank to render an empty list.
 * @default You haven't met anyone yet.
 *
 * @param characters
 * @text Characters
 * @type struct<Character>[]
 * @desc The cast of characters whose relationships are tracked.
 * @default []
 *
 * @param titleNames
 * @text Title Names
 * @type string[]
 * @desc Relationship titles from lowest to highest. Default 6 entries: Strangers → Soulmate.
 * @default ["Strangers","Acquaintances","Friends","Close Friends","Best Friends","Soulmate"]
 *
 * @param pointsPerTier
 * @text Points Per Tier
 * @type number
 * @min 1
 * @desc Points between event thresholds. Default 100 → events at 100, 200, ..., 700.
 * @default 100
 *
 * @param eventAvailableMarker
 * @text Event Available Marker
 * @type string
 * @desc Symbol shown next to a character in the menu when an event is available.
 * @default !
 *
 * @param soulmateColor
 * @text Soulmate Color
 * @type number
 * @min 0
 * @max 31
 * @desc Color index (0–31 from the System palette) used for the soulmate's name and heart in the menu. Default: 3 (green).
 * @default 3
 *
 * @param allowMultipleSoulmates
 * @text Allow Multiple Soulmates
 * @type boolean
 * @desc If ON, more than one character can be set as soulmate at the same time. Default: OFF (single-soulmate enforcement).
 * @default false
 *
 * @param gaugeColor
 * @text Gauge Color
 * @type number
 * @min 0
 * @max 31
 * @desc Color index (0–31) for the within-tier progress bar fill. Default: 23 (gold).
 * @default 23
 *
 * @param tierUpSe
 * @text Tier-Up SE
 * @type file
 * @dir audio/se
 * @desc Sound effect played when a character's title advances. Leave blank for no sound.
 * @default
 *
 * @param tierUpSeVolume
 * @text Tier-Up SE Volume
 * @type number
 * @min 0
 * @max 100
 * @desc Volume for the tier-up SE (0–100).
 * @default 90
 *
 * @param tierUpMessage
 * @text Tier-Up Message
 * @type string
 * @desc Message shown after returning from a tier-up event. %1 = display name, %2 = new title. Leave blank to disable.
 * @default %1 is now %2.
 *
 * @param toastEnabled
 * @text Toast Enabled
 * @type boolean
 * @desc Show a bottom-right notification when a character's points first cross a threshold with an event configured.
 * @default true
 *
 * @param toastMessage
 * @text Toast Message
 * @type string
 * @desc Toast notification text. %1 = character display name.
 * @default You and %1 are ready to have a talk.
 *
 * @param toastWidth
 * @text Toast Width
 * @type number
 * @min 200
 * @desc Width of the toast window in pixels.
 * @default 480
 *
 * @param toastPosition
 * @text Toast Position
 * @type select
 * @option Top-Left
 * @value topleft
 * @option Top-Right
 * @value topright
 * @option Bottom-Left
 * @value bottomleft
 * @option Bottom-Right
 * @value bottomright
 * @desc Which screen corner the toast anchors to.
 * @default bottomright
 *
 * @param toastShowFace
 * @text Toast Show Face
 * @type boolean
 * @desc If ON, the character's face image is shown to the left of the toast text. If OFF, text uses the full window width.
 * @default true
 *
 * @param toastMarginX
 * @text Toast Margin X
 * @type number
 * @min 0
 * @desc Horizontal distance in pixels from the chosen corner to the toast window.
 * @default 24
 *
 * @param toastMarginY
 * @text Toast Margin Y
 * @type number
 * @min 0
 * @desc Vertical distance in pixels from the chosen corner to the toast window.
 * @default 24
 *
 * @param toastDwellFrames
 * @text Toast Dwell Frames
 * @type number
 * @min 1
 * @desc How long the toast stays fully visible, in frames (60 = 1 second at default framerate).
 * @default 150
 *
 * @param toastSe
 * @text Toast SE
 * @type file
 * @dir audio/se
 * @desc Sound effect played when a toast appears. Leave blank for no sound.
 * @default
 *
 * @param toastSeVolume
 * @text Toast SE Volume
 * @type number
 * @min 0
 * @max 100
 * @desc Volume for the toast SE (0–100).
 * @default 90
 *
 * @param showSwitchId
 * @text Show Switch
 * @type switch
 * @desc Optional. If non-zero, the menu command only appears while this switch is ON. 0 = always visible.
 * @default 0
 *
 * @command addPoints
 * @text Add Points
 * @desc Add (or subtract) relationship points for one character.
 *
 * @arg key
 * @text Character Key
 * @type string
 * @desc Must match a Key from the Characters parameter.
 *
 * @arg amount
 * @text Amount
 * @type number
 * @min -999999
 * @desc Amount to add. Use a negative number to subtract.
 * @default 0
 *
 * @command setPoints
 * @text Set Points
 * @desc Set a character's relationship points to an exact value.
 *
 * @arg key
 * @text Character Key
 * @type string
 * @desc Must match a Key from the Characters parameter.
 *
 * @arg amount
 * @text Amount
 * @type number
 * @min 0
 * @desc New point total. Clamped to the current cap (500 normally, 700 if soulmate).
 * @default 0
 *
 * @command meetCharacter
 * @text Meet Character
 * @desc Register a character so they appear in the menu as "Strangers". Call from the story event where the player first meets them.
 *
 * @arg key
 * @text Character Key
 * @type string
 * @desc Must match a Key from the Characters parameter.
 *
 * @command playCharacterEvent
 * @text Play Character Event
 * @desc If the named character has a pending event, save the player's position, teleport them to the event map, and advance state.
 *
 * @arg key
 * @text Character Key
 * @type string
 * @desc Must match a Key from the Characters parameter.
 *
 * @command returnFromEvent
 * @text Return From Event
 * @desc Teleport the player back to the location saved by the most recent Play Character Event. Place at the end of every event map.
 *
 * @command setSoulmate
 * @text Set Soulmate
 * @desc Mark a character as the player's soulmate. Raises their cap to 700 and sets their title to Soulmate. Use inside the 500-point event's conditional branch.
 *
 * @arg key
 * @text Character Key
 * @type string
 * @desc Must match a Key from the Characters parameter.
 *
 * @command setDescription
 * @text Set Description
 * @desc Set the description text shown on the character's detail page. Overrides the Description field in the Characters parameter.
 *
 * @arg key
 * @text Character Key
 * @type string
 * @desc Must match a Key from the Characters parameter.
 *
 * @arg text
 * @text Description Text
 * @type multiline_string
 * @desc New description. Supports text codes (\C[n], \I[n], etc.) and newlines. Pass an empty value to clear the override.
 * @default
 *
 * @help RelationshipTracker.js
 *
 * Adds a "Relationships" command to the main menu (directly below Status).
 * Each tracked character has a relationship score, an event-driven title,
 * and a set of event maps that play at score thresholds.
 *
 * ─── Quick Start Tutorial ────────────────────────────────
 * Worked example: add a character "Test1", give them a face, wire up
 * one event map, and play it from the menu.
 *
 * STEP 1 — Add the character entry
 *   Plugin Manager → RelationshipTracker → double-click. Click the
 *   "Characters" field, then "Add new entry". Fill in:
 *     Key          : test1
 *     Display Name : Test1
 *     Face Image   : pick any file from img/faces (e.g. Actor1)
 *     Face Index   : 0   (0–7, left-to-right then top-to-bottom)
 *     Description  : (optional) a sentence or two of flavor text shown
 *                    on the character's detail page. Supports text codes
 *                    and newlines — see "Descriptions" below.
 *   Leave the event map IDs at 0 for now. Save.
 *
 * STEP 2 — Create an event map and learn its ID
 *   In the editor's map tree (left panel), right-click an empty area
 *   and pick "New Map". Name it "Test1 - 100 Event". After it's made,
 *   right-click it → Edit. The dialog title shows the map's ID
 *   (e.g. "ID: 005"). Remember the number.
 *   Tip: you can also peek at the project's data/ folder — each map
 *   is saved as data/MapNNN.json, where NNN is the ID.
 *
 * STEP 3 — Wire that map back into the plugin
 *   Plugin Manager → RelationshipTracker → Characters → edit Test1's
 *   entry → set "100-Point Event Map" to the ID from Step 2. Save.
 *
 * STEP 4 — Build the event content
 *   Open Test1's 100-Event map. Place an event at any tile, set its
 *   trigger to Autorun, and add:
 *     Text: "Test1's 100-point event runs here."
 *     Plugin Command: RelationshipTracker → Return From Event
 *   Return From Event teleports the player back to where they were.
 *
 * STEP 5 — Build the meeting event (the "0 event")
 *   On any story map, place an event the player can walk up to.
 *   Trigger: Action Button. Contents:
 *     Text: "You meet Test1."
 *     Plugin Command: RelationshipTracker → Meet Character
 *       key: test1
 *     Control Self Switch: A = ON
 *   Add a second event page conditioned on Self Switch A = ON, left
 *   blank, so the meeting doesn't replay.
 *
 * STEP 6 — Award some points
 *   Anywhere — chest, NPC, parallel process:
 *     Plugin Command: RelationshipTracker → Add Points
 *       key:    test1
 *       amount: 100
 *   Open the menu. Test1 now reads "Strangers — 100/100 !".
 *
 * STEP 7 — Play the event from the menu
 *   Open the Relationships menu, pick Test1, choose "Play Event".
 *   The player teleports to Test1's 100-Event map, the event runs,
 *   Return From Event teleports them back. Test1's title is now
 *   "Acquaintances".
 *
 * To add more events, repeat Steps 2–4 for each threshold (200, 300,
 * 400, 500, 600, 700) and wire each map into the matching plugin
 * param field.
 *
 * About the 500 event: it's where the soulmate choice happens.
 * Inside that map's event, present a Show Choices dialog. On the
 * "soulmate" branch, gate Set Soulmate with a Conditional Branch
 * checking this script expression:
 *   $gameSystem.getCurrentSoulmate() === null
 * to prevent assigning two soulmates.
 *
 * About entering event maps cleanly: the plugin teleports the player
 * to the spawn point configured per event (Spawn X, Spawn Y, Spawn
 * Direction fields under each map ID). Defaults are (0, 0) facing
 * Down — the same as v2.4.1 hardcoded behavior, so existing characters
 * work without changes. The transfer uses a black fade; if you need
 * additional control over the entry beat (positioning by story state,
 * dynamic fade-in timing, etc.) the event map's autorun can still
 * reposition the player and call Fadein Screen as usual.
 *
 * ─── Descriptions ────────────────────────────────────────
 * Each character can have a description: free-form flavor text shown
 * on the right side of their detail page. Two ways to set it:
 *
 *   1. Initial value — Plugin Manager → Characters → edit a character
 *      → Description. This is what shows up the moment the character
 *      is met.
 *
 *   2. Runtime override — Plugin Command "Set Description" replaces
 *      the displayed text for that character. Useful for plot beats:
 *      a character's blurb updates after a major story event.
 *      The override is saved with the game. Pass an empty value to
 *      clear it (the menu reverts to the Plugin Manager Description).
 *
 * Both fields are multiline and support MZ's standard text codes —
 *   \C[n]   color (0–31 from the System palette)
 *   \I[n]   draw icon n inline
 *   \V[n]   value of variable n
 *   \N[n]   actor n's name
 *   \{ \}   font-size up / down
 *   \.      brief pause   \|  longer pause   \!  wait for input
 * — and any custom codes other plugins register. Press Enter in the
 * Plugin Manager text area for a hard line break.
 *
 * The description window auto-wraps text on width (as of v2.4) — long
 * single lines break at word boundaries to fit the panel. Text codes
 * are preserved across line breaks. Explicit \n in your text is still
 * honored as a forced break. If the wrapped text exceeds the window's
 * height, lines below the bottom edge clip silently.
 *
 * Example description:
 *   \C[2]Demon, daughter of Ba'al.\C[0]
 *   Found in the slums of Verras after the temple collapse.
 *
 * ─── Tier-Up Notification ────────────────────────────────
 * When a character's title actually changes (i.e., when an event below
 * the choice threshold plays, or when Set Soulmate runs), the plugin
 * fires a notification at the END of the event — when Return From
 * Event runs. This is the Persona-style beat: event content plays,
 * the sting drops, the player sees the new title, then returns home.
 *
 * Configure via three plugin parameters:
 *   Tier-Up SE         — pick a file from audio/se. Blank = no sound.
 *   Tier-Up SE Volume  — 0–100.
 *   Tier-Up Message    — text shown by the notification. %1 = display
 *                        name, %2 = new title. Blank = no message.
 *                        Default: "%1 is now %2."
 *
 * The exact flow when an event launches a tier-up:
 *   1. advanceCharacterEvent (or setSoulmate) runs, changing the title
 *      and recording a pending tier-up on $gameSystem.
 *   2. Player transfers to the event map; the autorun plays the scene.
 *   3. Autorun ends with Return From Event. The plugin command plays
 *      the SE and queues the message via $gameMessage.
 *   4. $gameMessage displays the queued text; player dismisses it with
 *      the action button. The transfer-back is gated on the message
 *      window being free, so it waits for the dismissal.
 *   5. Player transfers back to wherever the event was triggered from.
 *
 * Saves made mid-event-map preserve the pending tier-up, so a load
 * followed by Return From Event still fires the notification.
 *
 * No notification fires for the 500/600/700 thresholds via
 * advanceCharacterEvent (those don't change titles via that path):
 * the 500 event triggers the notification only if Set Soulmate runs
 * inside it; the 600/700 events are flavor moments where the title is
 * already Soulmate.
 *
 * ─── Soulmate Styling ────────────────────────────────────
 * Once a character is marked soulmate, their display name shows in the
 * configured Soulmate Color with a heart (♥) appended, in both the
 * relationship list and the detail page. The Soulmate Color parameter
 * is a System palette index (0–31); default 3 is green. Use the editor's
 * Database → Terms or any standard MZ color reference to pick a value.
 *
 * ─── Progress Gauge ──────────────────────────────────────
 * Within-tier progress is shown as a filled bar in both the
 * relationship list (compact, right of the title) and the detail
 * page's profile window (wider, beside the "Progress:" label). The
 * bar fills from 0 to pointsPerTier (default 100) as the player
 * approaches the next threshold; the numeric value (e.g. "75/100") is
 * centered over the bar with a drop shadow for readability.
 *
 * At MAX (no further events reachable), the bar shows fully filled
 * with "MAX" centered over it.
 *
 * The fill color is configurable via the Gauge Color plugin
 * parameter — a System palette index. Default is 23 (gold). Soulmate
 * styling and gauge color are independent, so you can pair colors
 * however you like.
 *
 * ─── Rank Pips ───────────────────────────────────────────
 * The detail page's profile window includes a "Rank:" row showing
 * one circle per reachable event threshold. Filled circles (●) mark
 * events that have already played; empty circles (○) mark events the
 * player has yet to trigger.
 *
 * Non-soulmate characters show 5 circles (for the 100/200/300/400/500
 * events). Soulmate characters show 7 (adding 600/700). Circles
 * "fill" once the corresponding event runs and the title advances
 * past that threshold.
 *
 * Filled circles use the Gauge Color (default gold). Empty circles
 * use the gauge backdrop color (dimmer), for visual distinction
 * between completed and pending.
 *
 * ─── Multiple Soulmates ──────────────────────────────────
 * By default (as of v2.3), only one character can be soulmate at a
 * time — Set Soulmate refuses to assign a second one. To allow
 * polyamory routes or other game designs where multiple characters
 * can be soulmate simultaneously, set the Allow Multiple Soulmates
 * plugin parameter to ON. The exclusivity check is skipped entirely
 * when that flag is set.
 *
 * With multiple soulmates allowed, getCurrentSoulmate() still returns
 * just one key (the first match in iteration order). To enumerate all
 * soulmates, use getAllSoulmates() which returns an array.
 *
 * ─── Threshold-Crossed Toast ─────────────────────────────
 * When a character's points first cross a threshold with an event
 * configured, the plugin shows a notification window with (optionally)
 * the character's face and a configurable line of text. The toast is
 * one-shot per character per threshold — once shown, that specific
 * milestone never re-toasts, even across save/load cycles.
 *
 * Lifecycle: fade in (15 frames) → hold (Toast Dwell Frames, default
 * 150 frames ≈ 2.5s at 60fps) → fade out (30 frames). The toast
 * dismisses itself automatically; there is no input interaction. While
 * a toast is in flight, additional toasts queue serially and play one
 * at a time.
 *
 * Text rendering: the message is plain text with word-wrap. Text codes
 * (\C[n], \I[n], etc.) are NOT supported in toast messages — wrap
 * measurement can't reason about them. The window's height
 * auto-expands to fit wrapped lines (the width is what you configure;
 * height grows from the anchored edge). For longer messages,
 * either widen the toast or accept the multi-line wrap.
 *
 * Positioning (v2.4.1): Toast Position picks the screen corner the toast
 * anchors to — Top-Left, Top-Right, Bottom-Left, or Bottom-Right
 * (default). Toast Margin X / Toast Margin Y set the distance from
 * that corner in pixels (defaults 24/24). The toast grows toward the
 * opposite edge for taller multi-line wraps.
 *
 * Face image (v2.4.1): Toast Show Face toggles the face thumbnail on the
 * left side of the toast. When ON (default), the configured character
 * face is rendered at 72×72 and text occupies the remaining width.
 * When OFF, text uses the full inner width and the window's height
 * tracks the text block alone (no face-size floor).
 *
 * Suppression: toasts won't display while a message window is active,
 * while an event is running, while the player is on a relationship
 * event map, or while a map transfer is pending. They wait in the
 * queue until those conditions clear. Toasts queued mid-event will
 * surface after Return From Event completes its transfer-back.
 *
 * Configurable plugin parameters: Toast Enabled (master switch),
 * Toast Message (%1 = character name), Toast Width, Toast Position,
 * Toast Show Face, Toast Margin X / Y, Toast Dwell Frames, Toast SE,
 * Toast SE Volume. Fade durations are hardcoded at 15/30 frames.
 *
 * ─── Empty State ─────────────────────────────────────────
 * When the player opens the Relationships menu before meeting any
 * characters, the list is empty. The Empty State Message plugin
 * parameter sets the placeholder text shown in that case (default:
 * "You haven't met anyone yet."). Leave the parameter blank to render
 * a fully empty list with no placeholder.
 *
 * ─── Detail Scene Navigation ─────────────────────────────
 * Inside a character's detail page, the player can cycle between met
 * characters without backing out to the list. The next/previous
 * character is bound to two key sets:
 *   PgUp / PgDn  (Q / W on keyboard, L1 / R1 on gamepad)
 *   Cursor Left / Right (arrow keys, D-pad)
 * Cycling wraps — pressing "next" on the last character jumps to the
 * first, and vice versa. The window contents (profile, description,
 * commands) update in place; "Play Event" appears or hides based on
 * the newly-shown character's pending state.
 *
 * ─── Portrait Fallback ───────────────────────────────────
 * Characters with no Face Image configured fall back to Actor1 at
 * face index 0 (the default starter face that ships with every MZ
 * project). The fallback applies in both the detail-scene profile
 * and the threshold-crossed toast, so a character configured without
 * art still renders cleanly during development and won't leave a
 * blank space in the UI.
 *
 * ─── Per-Event Spawn Points ──────────────────────────────
 * Each event map has its own spawn point. Under each Character →
 * NNN-Point Event Map field, three additional fields control where
 * the player lands on that map and which way they face:
 *   NNN-Point Event Spawn X         — tile X coordinate (default 0)
 *   NNN-Point Event Spawn Y         — tile Y coordinate (default 0)
 *   NNN-Point Event Spawn Direction — Down / Left / Right / Up
 *                                     (default Down)
 * Defaults preserve v2.4.1 behavior — (0, 0) facing Down — so existing
 * characters work without any param changes. The event map's autorun
 * can still override positioning if your scene needs dynamic placement.
 *
 * ─── Core Model ──────────────────────────────────────────
 * Each character has independent state on $gameSystem:
 *   - points: 0–500 normally; 0–700 if marked soulmate.
 *   - titleIndex: only advances when a threshold event plays. Points can
 *                  sit at the next threshold with the title not yet
 *                  changed (the marker tells the player an event awaits).
 *   - met: false until Meet Character is called.
 *   - isSoulmate: false until Set Soulmate is called.
 *   - nextEventThreshold: the points value of the next unplayed event.
 *
 * Events fire at thresholds 100, 200, 300, 400, 500, 600, 700. The 0
 * "event" is just the story moment where the player first encounters
 * the character — at the end of that story event, run Meet Character.
 * The 500 event is the choice point: a conditional branch inside its
 * event map decides whether the player stays Best Friends or becomes
 * Soulmate. Only one character can be soulmate at a time. Since v2.3,
 * the plugin itself enforces this — Set Soulmate refuses (with a console
 * warning) when another soulmate already exists. The event-author
 * pattern using `getCurrentSoulmate() === null` is still recommended so
 * the player sees a graceful "let-down" branch instead of nothing.
 *
 * Threshold → title mapping (when the event plays):
 *   100 → Acquaintances    400 → Best Friends
 *   200 → Friends          500 → (choice; stays Best Friends or → Soulmate)
 *   300 → Close Friends    600, 700 → no title change (soulmate flavor)
 *
 * ─── Authoring Flow ──────────────────────────────────────
 * 1. Register each character in the Characters parameter. Give them a
 *    unique key, a display name, face image fields, an optional
 *    description, and event map IDs for the threshold events you want
 *    to use. The face and description show on the character's detail
 *    page once the player has met them.
 *
 * 2. In the story event where the player first meets the character,
 *    run "Meet Character" at the end. The character now appears in the
 *    Relationships menu as "Strangers".
 *
 * 3. Award points throughout the story with "Add Points". When points
 *    reach the next 100-mark, the menu marks that character with the
 *    event-available symbol.
 *
 * 4. Place an NPC event for the character somewhere in the world. Inside,
 *    use a Conditional Branch with a script expression
 *      $gameSystem.hasPendingEvent("characterKey")
 *    to decide whether to run normal dialogue or call "Play Character
 *    Event" to launch the threshold event.
 *
 * 5. On each event map, the LAST event command should be "Return From
 *    Event", which teleports the player back to where they were.
 *
 * 6. Inside the 500 event, present the choice. If the player chooses to
 *    become soulmates, call "Set Soulmate". Exclusivity is enforced by
 *    the plugin (since v2.3), but it's still good practice to gate the
 *    choice with a `getCurrentSoulmate() === null` conditional so the
 *    player sees a coherent "someone else already" branch rather than a
 *    silently-refused Set Soulmate call.
 *
 * ─── Script Calls ────────────────────────────────────────
 *   $gameSystem.getRelationshipPoints(key)
 *   $gameSystem.setRelationshipPoints(key, value)
 *   $gameSystem.addRelationshipPoints(key, delta)
 *   $gameSystem.getRelationshipTitleIndex(key)   // 0–5
 *   $gameSystem.getRelationshipTitleName(key)    // "Strangers" etc.; "???" if unmet
 *   $gameSystem.isMet(key)
 *   $gameSystem.isSoulmate(key)
 *   $gameSystem.getCurrentSoulmate()             // key of soulmate, or null
 *   $gameSystem.getAllSoulmates()                 // array of soulmate keys (typically 0 or 1)
 *   $gameSystem.hasPendingEvent(key)
 *   $gameSystem.getNextEventThreshold(key)       // next event point value, or null
 *   $gameSystem.meetCharacter(key)
 *   $gameSystem.setSoulmate(key)
 *   $gameSystem.getRelationshipDescription(key)  // override if set, else plugin-param default
 *   $gameSystem.setRelationshipDescription(key, text)  // pass "" to clear the override
 *
 * Backward-compat aliases (v1.0.0 names, kept so old event scripts work):
 *   $gameSystem.getRelationshipTier(key)         // = getRelationshipTitleIndex
 *   $gameSystem.getRelationshipTierName(key)     // = getRelationshipTitleName
 *
 * Example — gate dialogue on Lillith being at least Friend (index 2):
 *   $gameSystem.getRelationshipTitleIndex("lillith") >= 2
 *
 * Example — only allow choosing soulmate if nobody else is one yet:
 *   $gameSystem.getCurrentSoulmate() === null
 *
 * ─── Caps ────────────────────────────────────────────────
 * Non-soulmate cap: pointsPerTier × 5  (default 500: Best Friends max).
 * Soulmate cap:     pointsPerTier × 7  (default 700: Soulmate max).
 * Points are hard-capped. Add Points beyond the cap silently clamps.
 *
 * ─── Save Compatibility ──────────────────────────────────
 * Relationship state lives on $gameSystem and is saved automatically.
 * Saves from before this plugin was installed will lazily initialize
 * each character to zero/unmet the first time their data is queried.
 * Saves made with v2.0 or v2.1 (before descriptions existed) load
 * cleanly — the description field is backfilled to null on first read
 * so each character shows the plugin-param description until/unless
 * Set Description writes an override.
 *
 * ─── Known Limitations (Beta) ────────────────────────────
 * - Soulmate exclusivity IS enforced (since v2.3) — Set Soulmate
 *   refuses to assign a second soulmate. Authors are still encouraged
 *   to gate the 500-event "soulmate" choice on
 *   getCurrentSoulmate() === null so the player sees a graceful
 *   alternative branch instead of nothing.
 * - Event maps teleport the player to (0, 0) facing down with a black
 *   fade. Author each event map's autorun to position the player and
 *   call Fadein Screen at the desired speed.
 * - Autorun event maps need a Self Switch toggle at the end (Control
 *   Self Switch A = ON) to prevent the autorun from re-triggering
 *   before the Return From Event transfer fires. Add a blank second
 *   event page conditioned on that switch.
 *
 * ─── License ─────────────────────────────────────────────
 * Copyright 2026 wg481 (Massimo Russell).
 *
 * Licensed under the Apache License, Version 2.0, with additional
 * terms. The full text is in the LICENSE file distributed with this
 * plugin. Summary of permissions and conditions:
 *
 *   PERMITTED:
 *     - Commercial use
 *     - Non-commercial use
 *     - Modification
 *     - Distribution
 *     - Sublicensing under compatible terms (per Apache 2.0)
 *
 *   REQUIRED:
 *     - Include a copy of the LICENSE file with any distribution that
 *       contains this Work (Apache 2.0 §4(a)).
 *     - If you modify the source files, mark each modified file with a
 *       prominent notice stating that you changed it (§4(b)).
 *     - Display the attribution line "Uses wg481's relationship
 *       technology." in your product's visible credits, opening
 *       titles, or about screen (ADDITIONAL TERMS, see LICENSE file).
 *       The line must be legible and readable by end users during
 *       normal operation; placement alongside other third-party
 *       attributions is fine. The full LICENSE text does NOT need to
 *       be reachable from in-game menus, only the attribution line.
 *
 *   NO WARRANTY: provided "AS IS" without warranty of any kind.
 *
 * If you do not agree to these terms, do not use this Work.
 */

/*~struct~Character:
 * @param key
 * @text Key
 * @type string
 * @desc Unique identifier used by plugin commands and script calls (e.g. "lillith").
 *
 * @param displayName
 * @text Display Name
 * @type string
 * @desc Name displayed in the Relationships menu.
 *
 * @param faceName
 * @text Face Image
 * @type file
 * @dir img/faces
 * @desc Face sheet shown on the per-character detail scene. Browse from img/faces.
 *
 * @param faceIndex
 * @text Face Index
 * @type number
 * @min 0
 * @max 7
 * @desc Position within the face sheet (0–7).
 * @default 0
 *
 * @param eventMap100
 * @text 100-Point Event Map
 * @type number
 * @min 0
 * @desc Map ID for the 100-point event (advances title to Acquaintances). 0 = not configured.
 * @default 0
 *
 * @param eventMap100X
 * @text 100-Point Event Spawn X
 * @type number
 * @min 0
 * @desc Player's X tile coordinate on the event map after teleport. Default 0.
 * @default 0
 *
 * @param eventMap100Y
 * @text 100-Point Event Spawn Y
 * @type number
 * @min 0
 * @desc Player's Y tile coordinate on the event map after teleport. Default 0.
 * @default 0
 *
 * @param eventMap100Direction
 * @text 100-Point Event Spawn Direction
 * @type select
 * @option Down
 * @value 2
 * @option Left
 * @value 4
 * @option Right
 * @value 6
 * @option Up
 * @value 8
 * @desc Direction the player faces after teleport. Default: Down.
 * @default 2
 *
 * @param eventMap200
 * @text 200-Point Event Map
 * @type number
 * @min 0
 * @desc Map ID for the 200-point event (advances title to Friends). 0 = not configured.
 * @default 0
 *
 * @param eventMap200X
 * @text 200-Point Event Spawn X
 * @type number
 * @min 0
 * @desc Player's X tile coordinate on the event map after teleport. Default 0.
 * @default 0
 *
 * @param eventMap200Y
 * @text 200-Point Event Spawn Y
 * @type number
 * @min 0
 * @desc Player's Y tile coordinate on the event map after teleport. Default 0.
 * @default 0
 *
 * @param eventMap200Direction
 * @text 200-Point Event Spawn Direction
 * @type select
 * @option Down
 * @value 2
 * @option Left
 * @value 4
 * @option Right
 * @value 6
 * @option Up
 * @value 8
 * @desc Direction the player faces after teleport. Default: Down.
 * @default 2
 *
 * @param eventMap300
 * @text 300-Point Event Map
 * @type number
 * @min 0
 * @desc Map ID for the 300-point event (advances title to Close Friends). 0 = not configured.
 * @default 0
 *
 * @param eventMap300X
 * @text 300-Point Event Spawn X
 * @type number
 * @min 0
 * @desc Player's X tile coordinate on the event map after teleport. Default 0.
 * @default 0
 *
 * @param eventMap300Y
 * @text 300-Point Event Spawn Y
 * @type number
 * @min 0
 * @desc Player's Y tile coordinate on the event map after teleport. Default 0.
 * @default 0
 *
 * @param eventMap300Direction
 * @text 300-Point Event Spawn Direction
 * @type select
 * @option Down
 * @value 2
 * @option Left
 * @value 4
 * @option Right
 * @value 6
 * @option Up
 * @value 8
 * @desc Direction the player faces after teleport. Default: Down.
 * @default 2
 *
 * @param eventMap400
 * @text 400-Point Event Map
 * @type number
 * @min 0
 * @desc Map ID for the 400-point event (advances title to Best Friends). 0 = not configured.
 * @default 0
 *
 * @param eventMap400X
 * @text 400-Point Event Spawn X
 * @type number
 * @min 0
 * @desc Player's X tile coordinate on the event map after teleport. Default 0.
 * @default 0
 *
 * @param eventMap400Y
 * @text 400-Point Event Spawn Y
 * @type number
 * @min 0
 * @desc Player's Y tile coordinate on the event map after teleport. Default 0.
 * @default 0
 *
 * @param eventMap400Direction
 * @text 400-Point Event Spawn Direction
 * @type select
 * @option Down
 * @value 2
 * @option Left
 * @value 4
 * @option Right
 * @value 6
 * @option Up
 * @value 8
 * @desc Direction the player faces after teleport. Default: Down.
 * @default 2
 *
 * @param eventMap500
 * @text 500-Point Event Map
 * @type number
 * @min 0
 * @desc Map ID for the 500-point choice event. Use a conditional branch + Set Soulmate inside. 0 = not configured.
 * @default 0
 *
 * @param eventMap500X
 * @text 500-Point Event Spawn X
 * @type number
 * @min 0
 * @desc Player's X tile coordinate on the event map after teleport. Default 0.
 * @default 0
 *
 * @param eventMap500Y
 * @text 500-Point Event Spawn Y
 * @type number
 * @min 0
 * @desc Player's Y tile coordinate on the event map after teleport. Default 0.
 * @default 0
 *
 * @param eventMap500Direction
 * @text 500-Point Event Spawn Direction
 * @type select
 * @option Down
 * @value 2
 * @option Left
 * @value 4
 * @option Right
 * @value 6
 * @option Up
 * @value 8
 * @desc Direction the player faces after teleport. Default: Down.
 * @default 2
 *
 * @param eventMap600
 * @text 600-Point Event Map
 * @type number
 * @min 0
 * @desc Map ID for the 600-point soulmate-only event. 0 = not configured.
 * @default 0
 *
 * @param eventMap600X
 * @text 600-Point Event Spawn X
 * @type number
 * @min 0
 * @desc Player's X tile coordinate on the event map after teleport. Default 0.
 * @default 0
 *
 * @param eventMap600Y
 * @text 600-Point Event Spawn Y
 * @type number
 * @min 0
 * @desc Player's Y tile coordinate on the event map after teleport. Default 0.
 * @default 0
 *
 * @param eventMap600Direction
 * @text 600-Point Event Spawn Direction
 * @type select
 * @option Down
 * @value 2
 * @option Left
 * @value 4
 * @option Right
 * @value 6
 * @option Up
 * @value 8
 * @desc Direction the player faces after teleport. Default: Down.
 * @default 2
 *
 * @param eventMap700
 * @text 700-Point Event Map
 * @type number
 * @min 0
 * @desc Map ID for the 700-point soulmate-only event. 0 = not configured.
 * @default 0
 *
 * @param eventMap700X
 * @text 700-Point Event Spawn X
 * @type number
 * @min 0
 * @desc Player's X tile coordinate on the event map after teleport. Default 0.
 * @default 0
 *
 * @param eventMap700Y
 * @text 700-Point Event Spawn Y
 * @type number
 * @min 0
 * @desc Player's Y tile coordinate on the event map after teleport. Default 0.
 * @default 0
 *
 * @param eventMap700Direction
 * @text 700-Point Event Spawn Direction
 * @type select
 * @option Down
 * @value 2
 * @option Left
 * @value 4
 * @option Right
 * @value 6
 * @option Up
 * @value 8
 * @desc Direction the player faces after teleport. Default: Down.
 * @default 2
 *
 * @param description
 * @text Description
 * @type note
 * @desc Initial description shown on the character's detail page. Supports text codes (\C[n], \I[n], etc.) and newlines. Can be overridden at runtime with Set Description.
 * @default ""
 */

(() => {
	"use strict";

	const PLUGIN_NAME = "RelationshipTracker";
	const params = PluginManager.parameters(PLUGIN_NAME);

	//-------------------------------------------------------------------------
	// Parameter parsing
	//-------------------------------------------------------------------------

	const menuCommandLabel = String(params.menuCommandLabel || "Relationships");
	const emptyStateMessage = String(params.emptyStateMessage == null ? "You haven't met anyone yet." : params.emptyStateMessage);
	const pointsPerTier = Math.max(1, Number(params.pointsPerTier || 100));
	const showSwitchId = Number(params.showSwitchId || 0);
	const eventAvailableMarker = String(params.eventAvailableMarker || "!");
	const soulmateColor = Math.max(0, Math.min(31, Number(params.soulmateColor || 3)));
	const allowMultipleSoulmates = String(params.allowMultipleSoulmates || "false") === "true";
	const gaugeColor = Math.max(0, Math.min(31, Number(params.gaugeColor || 23)));
	const tierUpSe = String(params.tierUpSe || "");
	const tierUpSeVolume = Math.max(0, Math.min(100, Number(params.tierUpSeVolume || 90)));
	const tierUpMessage = String(params.tierUpMessage == null ? "%1 is now %2." : params.tierUpMessage);
	const toastEnabled = String(params.toastEnabled || "true") === "true";
	const toastMessage = String(params.toastMessage == null ? "You and %1 are ready to have a talk." : params.toastMessage);
	const toastWidth = Math.max(200, Number(params.toastWidth || 480));
	const toastPosition = (() => {
		const v = String(params.toastPosition || "bottomright");
		const allowed = ["topleft", "topright", "bottomleft", "bottomright"];
		return allowed.indexOf(v) >= 0 ? v : "bottomright";
	})();
	const toastShowFace = String(params.toastShowFace || "true") === "true";
	const toastMarginX = Math.max(0, Number(params.toastMarginX == null ? 24 : params.toastMarginX));
	const toastMarginY = Math.max(0, Number(params.toastMarginY == null ? 24 : params.toastMarginY));
	const toastDwellFrames = Math.max(1, Number(params.toastDwellFrames || 150));
	const toastSe = String(params.toastSe || "");
	const toastSeVolume = Math.max(0, Math.min(100, Number(params.toastSeVolume || 90)));
	// Hardcoded: fade durations. Kept out of plugin params to avoid
	// configuration sprawl — users can live with these defaults. Margins
	// were promoted to params in v2.4.1; see toastMarginX / toastMarginY.
	const TOAST_FADE_IN_FRAMES = 15;
	const TOAST_FADE_OUT_FRAMES = 30;

	const titleNames = (() => {
		try {
			const arr = JSON.parse(params.titleNames || "[]");
			return arr.map(s => String(s));
		} catch (e) {
			console.error(`${PLUGIN_NAME}: failed to parse titleNames`, e);
			return [];
		}
	})();

	// Portrait fallback (v2.4.2): characters with no faceName configured
	// fall back to Actor1[0]. Applied at parse time so all downstream
	// renderers (profile, toast) just read character.faceName /
	// character.faceIndex without needing their own fallback logic.
	const FALLBACK_FACE_NAME = "Actor1";
	const FALLBACK_FACE_INDEX = 0;

	// Event-map entry: each threshold's value is now an object with
	// mapId + spawn point (x, y, direction) instead of a bare number
	// (pre-v2.4.2). Missing fields default to 0 / 0 / Down (direction 2),
	// which matches the v2.4.1 behavior of teleporting to (0,0) facing
	// down. Existing plugin-param data parses cleanly because the new
	// fields read as undefined and Number(undefined || N) → N.
	function parseEventMap(obj, threshold) {
		const mapField = `eventMap${threshold}`;
		const xField = `eventMap${threshold}X`;
		const yField = `eventMap${threshold}Y`;
		const dirField = `eventMap${threshold}Direction`;
		return {
			mapId: Number(obj[mapField] || 0),
			x: Number(obj[xField] || 0),
			y: Number(obj[yField] || 0),
			// Direction defaults to 2 (Down) — matches MZ's reserveTransfer convention.
			direction: Number(obj[dirField] || 2)
		};
	}

	const characters = (() => {
		try {
			const arr = JSON.parse(params.characters || "[]");
			return arr.map(entry => {
				const obj = JSON.parse(entry);
				// `note` params are double-encoded — outer JSON gives a quoted
				// JSON string ("\"line1\\nline2\""), inner parse gives the
				// real multiline text. Fall back to empty on any failure.
				let description = "";
				if (obj.description) {
					try {
						description = String(JSON.parse(obj.description));
					} catch (e) {
						description = String(obj.description);
					}
				}
				// Portrait fallback: substitute Actor1[0] when no face is
				// configured. Done here so profile and toast renderers
				// always have a non-empty faceName to load.
				const rawFaceName = String(obj.faceName || "");
				const faceName = rawFaceName || FALLBACK_FACE_NAME;
				const faceIndex = rawFaceName ? Number(obj.faceIndex || 0) : FALLBACK_FACE_INDEX;
				return {
					key: String(obj.key || ""),
					displayName: String(obj.displayName || obj.key || ""),
					faceName: faceName,
					faceIndex: faceIndex,
					description: description,
					eventMaps: {
						100: parseEventMap(obj, 100),
						200: parseEventMap(obj, 200),
						300: parseEventMap(obj, 300),
						400: parseEventMap(obj, 400),
						500: parseEventMap(obj, 500),
						600: parseEventMap(obj, 600),
						700: parseEventMap(obj, 700)
					}
				};
			}).filter(c => c.key.length > 0);
		} catch (e) {
			console.error(`${PLUGIN_NAME}: failed to parse characters`, e);
			return [];
		}
	})();

	//-------------------------------------------------------------------------
	// Constants
	//
	// Title indices line up 1:1 with titleNames entries. The CHOICE_TIER is
	// the threshold at which the soulmate decision happens; thresholds at
	// or above it do NOT auto-advance titleIndex (setSoulmate handles the
	// promotion, otherwise the character stays Best Friends).
	//-------------------------------------------------------------------------

	const TITLE_SOULMATE_INDEX = 5;

	const CHOICE_TIER = 5;
	const SOULMATE_CAP_TIER = 7;
	const NON_SOULMATE_CAP_TIER = 5;

	const choiceThreshold = pointsPerTier * CHOICE_TIER;
	const soulmateCap = pointsPerTier * SOULMATE_CAP_TIER;
	const nonSoulmateCap = pointsPerTier * NON_SOULMATE_CAP_TIER;

	//-------------------------------------------------------------------------
	// Helpers
	//-------------------------------------------------------------------------

	function getCharacterConfig(key) {
		return characters.find(c => c.key === key) || null;
	}

	function getCapForCharacter(key) {
		return $gameSystem && $gameSystem.isSoulmate(key) ? soulmateCap : nonSoulmateCap;
	}

	function clampPoints(key, value) {
		const n = Math.floor(Number(value) || 0);
		return Math.max(0, Math.min(getCapForCharacter(key), n));
	}

	function isMenuVisible() {
		if (showSwitchId <= 0) return true;
		return $gameSwitches && $gameSwitches.value(showSwitchId);
	}

	// Plays the configured tier-up SE if one is set. AudioManager.playSe
	// takes a buzzer-like object; we build it with the configured volume
	// at default pitch/pan. No-op if the param is empty.
	function playTierUpSe() {
		if (!tierUpSe) return;
		AudioManager.playSe({
			name: tierUpSe,
			volume: tierUpSeVolume,
			pitch: 100,
			pan: 0
		});
	}

	// Records a pending tier-up notification on $gameSystem. The actual
	// display fires from Scene_Map.start when the player returns to the
	// world (i.e., when _relationshipReturnPoint has been cleared). See
	// the Scene_Map.start hook below for the display side. Stored on
	// $gameSystem so it survives saves made inside an event map.
	function queueTierUpNotification(displayName, titleName) {
		if (!tierUpMessage) return; // Message disabled via empty param.
		$gameSystem._pendingTierUpNotification = {
			displayName: String(displayName),
			titleName: String(titleName)
		};
	}

	// Shared progress-gauge renderer. Draws a filled bar at (x, y, w, h)
	// reflecting `rate` (0–1), then overlays `label` centered with a
	// 1px drop shadow for readability on either the fill or background
	// half. Reused by Window_RelationshipList row drawing and the
	// Window_RelationshipProfile progress line.
	//
	// Color choices: background uses ColorManager.gaugeBackColor (the
	// vanilla MZ gauge backdrop, typically dark). Fill uses the
	// configured gaugeColor palette index. The label text uses
	// normalColor (high-contrast against both states) with the shadow
	// in pure black at a single-pixel offset.
	function drawProgressGauge(window, x, y, w, h, rate, label) {
		const contents = window.contents;
		const clampedRate = Math.max(0, Math.min(1, rate));
		// Backdrop.
		contents.fillRect(x, y, w, h, ColorManager.gaugeBackColor());
		// Fill.
		const fillWidth = Math.floor(w * clampedRate);
		if (fillWidth > 0) {
			contents.fillRect(x, y, fillWidth, h, ColorManager.textColor(gaugeColor));
		}
		// Label with drop shadow. Center vertically by adjusting the
		// drawText baseline — drawText uses the contents' line baseline,
		// which sits roughly at fontSize/4 below the y passed in. To
		// vertically center inside the bar we offset by (h - fontSize)/2.
		if (label) {
			const fontSize = contents.fontSize;
			const textY = y + Math.floor((h - fontSize) / 2) - 4;
			// Shadow first, slightly offset, in black.
			const prevColor = contents.textColor;
			contents.textColor = "#000000";
			contents.drawText(label, x + 1, textY + 1, w, fontSize + 4, "center");
			// Foreground label in normal color.
			contents.textColor = ColorManager.normalColor();
			contents.drawText(label, x, textY, w, fontSize + 4, "center");
			contents.textColor = prevColor;
		}
	}

	// Shared by the playCharacterEvent plugin command and the detail
	// scene's Play Event command. Returns true if the transfer was
	// queued, false if anything blocked it (no pending event, missing
	// map ID, unknown key).
	//
	// As of v2.4.2, each event-map entry carries its own spawn point
	// (x, y, direction). The transfer uses those values; authors can
	// still override via an autorun on the event map if they need
	// per-state positioning.
	function triggerCharacterEvent(key) {
		if (!key) return false;
		if (!$gameSystem.hasPendingEvent(key)) {
			console.warn(`${PLUGIN_NAME}: triggerCharacterEvent called for "${key}" but no event is pending`);
			return false;
		}
		const character = getCharacterConfig(key);
		if (!character) return false;
		const threshold = $gameSystem.getNextEventThreshold(key);
		const entry = character.eventMaps[threshold];
		if (!entry || !entry.mapId || entry.mapId <= 0) {
			console.warn(`${PLUGIN_NAME}: no event map configured for "${key}" at threshold ${threshold}`);
			return false;
		}
		$gameSystem.saveReturnPoint(key);
		$gameSystem.advanceCharacterEvent(key);
		// Per-event spawn point with a black fade. The event map's
		// autorun may still override this positioning if needed.
		$gamePlayer.reserveTransfer(entry.mapId, entry.x, entry.y, entry.direction, 0);
		return true;
	}

	//-------------------------------------------------------------------------
	// Game_System — persistent storage and state machine
	//-------------------------------------------------------------------------

	const _Game_System_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_Game_System_initialize.call(this);
		this._relationshipData = {};
		this._relationshipReturnPoint = null;
		this._toastQueue = [];
	};

	Game_System.prototype._ensureRelationshipData = function() {
		if (!this._relationshipData) {
			this._relationshipData = {};
		}
	};

	Game_System.prototype._ensureCharacterData = function(key) {
		this._ensureRelationshipData();
		if (!this._relationshipData[key]) {
			this._relationshipData[key] = {
				points: 0,
				titleIndex: 0,
				met: false,
				isSoulmate: false,
				nextEventThreshold: null,
				description: null,
				toastsSeen: []
			};
		} else {
			// Backfill for saves made with older plugin versions.
			if (this._relationshipData[key].description === undefined) {
				// v2.0/v2.1 (pre-description).
				this._relationshipData[key].description = null;
			}
			if (this._relationshipData[key].toastsSeen === undefined) {
				// v2.0–v2.3 (pre-toast).
				this._relationshipData[key].toastsSeen = [];
			}
		}
		return this._relationshipData[key];
	};

	// — Toast detection (v2.4) —
	//
	// Called at the END of every method that might transition a
	// character into "event available" state. Compares a captured
	// "before" snapshot of hasPendingEvent against the current state.
	// On a false→true flip, AND only if we haven't shown a toast for
	// this threshold before, queue one. The seen-set is per-character
	// per-threshold so each milestone fires exactly once across the
	// game's lifetime, even across save/load.
	//
	// Suppression rules (handled at display time, not here): toasts
	// queued during cutscenes, messages, or while on an event map will
	// wait. The queue persists across saves, so a toast queued mid-event
	// will fire when the player returns to the world.

	Game_System.prototype._maybeQueueToast = function(key, wasPending) {
		if (!toastEnabled) return;
		const data = this._ensureCharacterData(key);
		const isPending = this.hasPendingEvent(key);
		if (!wasPending && isPending) {
			const threshold = data.nextEventThreshold;
			if (data.toastsSeen.indexOf(threshold) === -1) {
				data.toastsSeen.push(threshold);
				this._enqueueToast(key);
			}
		}
	};

	Game_System.prototype._enqueueToast = function(key) {
		if (!this._toastQueue) this._toastQueue = [];
		this._toastQueue.push({ key: key });
	};

	Game_System.prototype.dequeueToast = function() {
		if (!this._toastQueue || this._toastQueue.length === 0) return null;
		return this._toastQueue.shift();
	};

	Game_System.prototype.hasQueuedToast = function() {
		return !!(this._toastQueue && this._toastQueue.length > 0);
	};

	// — Points —

	Game_System.prototype.getRelationshipPoints = function(key) {
		return this._ensureCharacterData(key).points;
	};

	Game_System.prototype.setRelationshipPoints = function(key, value) {
		const data = this._ensureCharacterData(key);
		const wasPending = this.hasPendingEvent(key);
		data.points = clampPoints(key, value);
		this._maybeQueueToast(key, wasPending);
	};

	Game_System.prototype.addRelationshipPoints = function(key, delta) {
		this.setRelationshipPoints(key, this.getRelationshipPoints(key) + Number(delta));
	};

	// — Title —

	Game_System.prototype.getRelationshipTitleIndex = function(key) {
		return this._ensureCharacterData(key).titleIndex;
	};

	Game_System.prototype.getRelationshipTitleName = function(key) {
		if (!this.isMet(key)) return "???";
		const idx = this.getRelationshipTitleIndex(key);
		return titleNames[idx] || "";
	};

	// Backward-compat aliases (v1.0.0 names).
	Game_System.prototype.getRelationshipTier = function(key) {
		return this.getRelationshipTitleIndex(key);
	};
	Game_System.prototype.getRelationshipTierName = function(key) {
		return this.getRelationshipTitleName(key);
	};

	// — Description —
	//
	// Override pattern: the per-character state holds either a string
	// override (set via setDescription) or null (no override). When null,
	// the getter falls back to the Description field on the Character
	// parameter. This means edits to the plugin parameter mid-development
	// propagate to existing saves, while setDescription gives event authors
	// a way to mutate the text during play.

	Game_System.prototype.getRelationshipDescription = function(key) {
		const data = this._ensureCharacterData(key);
		if (data.description !== null && data.description !== undefined) {
			return data.description;
		}
		const character = getCharacterConfig(key);
		return character ? character.description : "";
	};

	Game_System.prototype.setRelationshipDescription = function(key, text) {
		const data = this._ensureCharacterData(key);
		data.description = String(text == null ? "" : text);
	};

	// — Flags —

	Game_System.prototype.isMet = function(key) {
		this._ensureRelationshipData();
		const data = this._relationshipData[key];
		return data ? data.met : false;
	};

	Game_System.prototype.isSoulmate = function(key) {
		this._ensureRelationshipData();
		const data = this._relationshipData[key];
		return data ? data.isSoulmate : false;
	};

	Game_System.prototype.getCurrentSoulmate = function() {
		this._ensureRelationshipData();
		for (const key in this._relationshipData) {
			if (this._relationshipData[key].isSoulmate) return key;
		}
		return null;
	};

	// Returns an array of all keys currently marked as soulmate. With
	// the default Allow Multiple Soulmates = OFF this is always 0 or 1
	// entries (`getCurrentSoulmate` is sufficient). With the flag ON,
	// games that want to iterate / count soulmates should use this
	// method instead of getCurrentSoulmate, which only returns one.
	Game_System.prototype.getAllSoulmates = function() {
		this._ensureRelationshipData();
		const keys = [];
		for (const key in this._relationshipData) {
			if (this._relationshipData[key].isSoulmate) keys.push(key);
		}
		return keys;
	};

	// — Events —

	Game_System.prototype.getNextEventThreshold = function(key) {
		return this._ensureCharacterData(key).nextEventThreshold;
	};

	Game_System.prototype.hasPendingEvent = function(key) {
		const data = this._ensureCharacterData(key);
		if (!data.met) return false;
		if (data.nextEventThreshold === null) return false;
		if (data.points < data.nextEventThreshold) return false;

		const character = getCharacterConfig(key);
		if (!character) return false;
		const entry = character.eventMaps[data.nextEventThreshold];
		// Pre-v2.4.2 the entry was a bare number (mapId); v2.4.2+ it's
		// {mapId, x, y, direction}. The bare-number case shouldn't
		// occur since all entries pass through parseEventMap, but
		// guard defensively.
		if (!entry) return false;
		const mapId = typeof entry === "number" ? entry : entry.mapId;
		return mapId > 0;
	};

	Game_System.prototype.meetCharacter = function(key) {
		const data = this._ensureCharacterData(key);
		if (data.met) return; // Idempotent — calling twice should not regress state.
		const wasPending = this.hasPendingEvent(key); // Always false since unmet, but for symmetry.
		data.met = true;
		data.titleIndex = 0;
		data.nextEventThreshold = pointsPerTier;
		this._maybeQueueToast(key, wasPending);
	};

	Game_System.prototype.setSoulmate = function(key) {
		const data = this._ensureCharacterData(key);
		if (!data.met) {
			console.warn(`${PLUGIN_NAME}: setSoulmate called on unmet character "${key}"`);
			return;
		}
		if (data.isSoulmate) return; // Already soulmate — idempotent no-op.

		// Exclusivity enforcement (added v2.3): refuse to set a second
		// soulmate. Belt-and-suspenders behind the event-author conditional
		// branch pattern (`getCurrentSoulmate() === null`). Can be opted
		// out per-game via the Allow Multiple Soulmates plugin param —
		// games that want polyamory routes set the flag and this check
		// is skipped entirely.
		if (!allowMultipleSoulmates) {
			const existing = this.getCurrentSoulmate();
			if (existing !== null && existing !== key) {
				console.warn(`${PLUGIN_NAME}: setSoulmate refused for "${key}" — "${existing}" is already soulmate`);
				return;
			}
		}

		const wasPending = this.hasPendingEvent(key);
		data.isSoulmate = true;
		data.titleIndex = TITLE_SOULMATE_INDEX;

		// Tier-up: soulmate title change happens here, not in
		// advanceCharacterEvent (which deliberately doesn't change the
		// title at/above choiceThreshold). The notification (SE + message)
		// is deferred to returnFromEvent so it plays after the event
		// content concludes, Persona-style — see returnFromEvent below.
		const character = getCharacterConfig(key);
		const titleName = this.getRelationshipTitleName(key);
		queueTierUpNotification(character ? character.displayName : key, titleName);

		// Toast detection: setSoulmate raises the cap (500→700) and also
		// resets the title to Soulmate. The cap raise is what matters for
		// pending detection — a character whose points were already past
		// 500 (but the next event was 600+ and unreachable) might become
		// newly-pending after promotion.
		this._maybeQueueToast(key, wasPending);
	};

	Game_System.prototype.advanceCharacterEvent = function(key) {
		// Called by the Play Character Event plugin command. Advances
		// titleIndex (only for thresholds below the choice threshold) and
		// bumps nextEventThreshold by pointsPerTier. State updates happen
		// BEFORE the teleport so the event map sees the new title.
		const data = this._ensureCharacterData(key);
		const threshold = data.nextEventThreshold;
		if (threshold === null) return;

		const titleChanged = threshold < choiceThreshold;
		if (titleChanged) {
			data.titleIndex = Math.floor(threshold / pointsPerTier);
		}
		// At/above choiceThreshold: title is changed by setSoulmate() if
		// the player chooses soulmate; otherwise it stays at Best Friends.

		data.nextEventThreshold = threshold + pointsPerTier;

		// Tier-up notification fires only when the title actually changed,
		// which is the same condition as titleChanged above. The 500/600/700
		// thresholds don't trigger this — soulmate progressions go through
		// setSoulmate (which has its own notification), and the 600/700
		// thresholds are flavor moments where the title stays at Soulmate.
		// The SE + message is deferred to returnFromEvent so it plays
		// after the event content concludes — see returnFromEvent below.
		if (titleChanged) {
			const character = getCharacterConfig(key);
			const titleName = this.getRelationshipTitleName(key);
			queueTierUpNotification(character ? character.displayName : key, titleName);
		}

		// Toast re-detection moved to returnFromEvent (v2.4.1) — see the
		// comment block on saveReturnPoint above. Calling _maybeQueueToast
		// here would enqueue a toast for the next-next threshold (the
		// "already past" case) while the player is mid-transfer to the
		// event map, which could leak a toast onto the event map during
		// the brief window between message dismissal and transfer-back.
		// Deferring to returnFromEvent closes that window structurally.
	};

	// — Return point —
	//
	// The return point carries the character key alongside the position
	// data (added in v2.4.1). The key is used by returnFromEvent to call
	// _maybeQueueToast(key, false), which detects whether the character
	// is newly pending again at the next-next threshold (the "already
	// past next threshold" case). This was moved out of advanceCharacterEvent
	// to avoid the toast queueing during the event-map phase, which
	// caused the v2.4 timing bug. Legacy return points from v2.4 saves
	// may lack the key field — returnFromEvent handles that gracefully.

	Game_System.prototype.saveReturnPoint = function(key) {
		this._relationshipReturnPoint = {
			mapId: $gameMap.mapId(),
			x: $gamePlayer.x,
			y: $gamePlayer.y,
			direction: $gamePlayer.direction(),
			key: key || null
		};
	};

	Game_System.prototype.getReturnPoint = function() {
		return this._relationshipReturnPoint;
	};

	Game_System.prototype.clearReturnPoint = function() {
		this._relationshipReturnPoint = null;
	};

	//-------------------------------------------------------------------------
	// Window_MenuCommand — insert command directly below Status
	//
	// Default addMainCommands order is Item, Skill, Equip, Status, so
	// appending here lands the new entry right after Status.
	//-------------------------------------------------------------------------

	const _Window_MenuCommand_addMainCommands = Window_MenuCommand.prototype.addMainCommands;
	Window_MenuCommand.prototype.addMainCommands = function() {
		_Window_MenuCommand_addMainCommands.call(this);
		if (isMenuVisible()) {
			const enabled = this.areMainCommandsEnabled();
			this.addCommand(menuCommandLabel, "relationships", enabled);
		}
	};

	//-------------------------------------------------------------------------
	// Scene_Menu — wire up the handler
	//-------------------------------------------------------------------------

	const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
	Scene_Menu.prototype.createCommandWindow = function() {
		_Scene_Menu_createCommandWindow.call(this);
		this._commandWindow.setHandler("relationships", this.commandRelationships.bind(this));
	};

	Scene_Menu.prototype.commandRelationships = function() {
		SceneManager.push(Scene_Relationships);
	};

	//-------------------------------------------------------------------------
	// Scene_Relationships
	//-------------------------------------------------------------------------

	function Scene_Relationships() {
		this.initialize(...arguments);
	}

	Scene_Relationships.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_Relationships.prototype.constructor = Scene_Relationships;

	Scene_Relationships.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	};

	Scene_Relationships.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createListWindow();
	};

	Scene_Relationships.prototype.createListWindow = function() {
		const rect = this.listWindowRect();
		this._listWindow = new Window_RelationshipList(rect);
		this._listWindow.setHandler("cancel", this.popScene.bind(this));
		this._listWindow.setHandler("ok", this.onListOk.bind(this));
		this.addWindow(this._listWindow);
	};

	Scene_Relationships.prototype.listWindowRect = function() {
		const wx = 0;
		const wy = this.mainAreaTop();
		const ww = Graphics.boxWidth;
		const wh = this.mainAreaHeight();
		return new Rectangle(wx, wy, ww, wh);
	};

	// Pushes the per-character detail scene for whichever met character
	// is currently highlighted. If the list is empty (no met characters),
	// pressing OK just re-activates so the player isn't stuck.
	Scene_Relationships.prototype.onListOk = function() {
		const character = this._listWindow.currentCharacter();
		if (!character) {
			this._listWindow.activate();
			return;
		}
		SceneManager.push(Scene_RelationshipDetail);
		SceneManager.prepareNextScene(character.key);
	};

	//-------------------------------------------------------------------------
	// Window_RelationshipList
	//
	// Only shows met characters. Each row displays the title from the
	// stored titleIndex (NOT derived from points) plus within-tier progress
	// or "MAX" if no further events remain. A trailing marker appears when
	// hasPendingEvent is true.
	//-------------------------------------------------------------------------

	function Window_RelationshipList() {
		this.initialize(...arguments);
	}

	Window_RelationshipList.prototype = Object.create(Window_Selectable.prototype);
	Window_RelationshipList.prototype.constructor = Window_RelationshipList;

	Window_RelationshipList.prototype.initialize = function(rect) {
		Window_Selectable.prototype.initialize.call(this, rect);
		this._metCharacters = this._computeMetCharacters();
		this.refresh();
		this.select(0);
		this.activate();
	};

	Window_RelationshipList.prototype._computeMetCharacters = function() {
		return characters.filter(c => $gameSystem.isMet(c.key));
	};

	Window_RelationshipList.prototype.maxItems = function() {
		return this._metCharacters ? this._metCharacters.length : 0;
	};

	Window_RelationshipList.prototype.currentCharacter = function() {
		if (!this._metCharacters) return null;
		return this._metCharacters[this.index()] || null;
	};

	Window_RelationshipList.prototype.itemHeight = function() {
		return this.lineHeight();
	};

	// Override to render the empty-state message when no characters
	// have been met yet. drawAllItems is a no-op when maxItems() is 0,
	// so the window would otherwise render as a blank box. The message
	// is centered vertically in the contents area; an empty
	// emptyStateMessage param suppresses the draw entirely (back to the
	// blank-box behavior).
	Window_RelationshipList.prototype.refresh = function() {
		Window_Selectable.prototype.refresh.call(this);
		if (this.maxItems() === 0 && emptyStateMessage) {
			const lineHeight = this.lineHeight();
			const y = Math.max(0, Math.floor((this.contents.height - lineHeight) / 2));
			this.drawText(emptyStateMessage, 0, y, this.contents.width, "center");
		}
	};

	Window_RelationshipList.prototype.drawItem = function(index) {
		const character = this._metCharacters[index];
		if (!character) return;
		const rect = this.itemLineRect(index);
		const key = character.key;
		const points = $gameSystem.getRelationshipPoints(key);
		const titleIdx = $gameSystem.getRelationshipTitleIndex(key);
		const titleName = titleNames[titleIdx] || "";
		const nextEvent = $gameSystem.getNextEventThreshold(key);
		const isSoulmate = $gameSystem.isSoulmate(key);
		const cap = isSoulmate ? soulmateCap : nonSoulmateCap;
		const pending = $gameSystem.hasPendingEvent(key);

		// Compute gauge state. At MAX, render a fully-filled bar with
		// "MAX" centered over it (per v2.4 design spec); otherwise the
		// bar fills proportionally to within-tier progress.
		let rate, label;
		const atMax = nextEvent === null || nextEvent > cap;
		if (atMax) {
			rate = 1;
			label = "MAX";
		} else {
			const lastEvent = nextEvent - pointsPerTier;
			const within = Math.max(0, Math.min(pointsPerTier, points - lastEvent));
			rate = within / pointsPerTier;
			label = `${within}/${pointsPerTier}`;
		}

		// Layout left-to-right:
		//   name (40% of row)
		//   title (~25%)
		//   gauge (~120px) with label centered
		//   pending marker (if any)
		const lineHeight = this.lineHeight();
		const gaugeWidth = 120;
		const gaugeHeight = 12;
		const markerWidth = pending ? 24 : 0;
		const nameWidth = Math.floor(rect.width * 0.40);
		const titleWidth = rect.width - nameWidth - gaugeWidth - markerWidth - 24; // 24px breathing room

		// Soulmate styling on name.
		const nameText = isSoulmate ? `${character.displayName} \u2665` : character.displayName;
		if (isSoulmate) {
			this.changeTextColor(ColorManager.textColor(soulmateColor));
		} else {
			this.resetTextColor();
		}
		this.drawText(nameText, rect.x, rect.y, nameWidth, "left");
		this.resetTextColor();

		// Title.
		this.drawText(titleName, rect.x + nameWidth, rect.y, titleWidth, "left");

		// Gauge. Vertical-center inside the row's line height.
		const gaugeX = rect.x + nameWidth + titleWidth;
		const gaugeY = rect.y + Math.floor((lineHeight - gaugeHeight) / 2);
		drawProgressGauge(this, gaugeX, gaugeY, gaugeWidth, gaugeHeight, rate, label);

		// Pending-event marker on the far right.
		if (pending) {
			this.changeTextColor(ColorManager.powerUpColor());
			this.drawText(eventAvailableMarker, gaugeX + gaugeWidth, rect.y, markerWidth, "right");
			this.resetTextColor();
		}
	};

	//-------------------------------------------------------------------------
	// Scene_RelationshipDetail
	//
	// Per-character detail page: portrait (left), info text (top-right),
	// commands (bottom-right). The "Play Event" command only appears when
	// hasPendingEvent is true; "Back" is always shown.
	//
	// Selecting Play Event saves the player's position, advances state,
	// queues the transfer, and SceneManager.goto's back to Scene_Map so
	// the engine processes the reserved transfer naturally. The black
	// fade type means the player never sees the world map flash.
	//-------------------------------------------------------------------------

	function Scene_RelationshipDetail() {
		this.initialize(...arguments);
	}

	Scene_RelationshipDetail.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_RelationshipDetail.prototype.constructor = Scene_RelationshipDetail;

	Scene_RelationshipDetail.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
		this._key = null;
	};

	// Receives the character key from SceneManager.prepareNextScene.
	Scene_RelationshipDetail.prototype.prepare = function(key) {
		this._key = key;
	};

	Scene_RelationshipDetail.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createProfileWindow();
		this.createDescriptionWindow();
		this.createCommandWindow();
	};

	// Layout:
	//   ┌────────────┬──────────────────────┐
	//   │            │                      │
	//   │  Profile   │     Description      │
	//   │ (face +    │                      │
	//   │  stats)    ├──────────────────────┤
	//   │            │     [Command]        │
	//   └────────────┴──────────────────────┘
	// Profile is fixed 360px wide on the left (a hair wider than v2.1's
	// 320px portrait, to give the stats text room next to the 144px face).
	// Description fills the upper right. Command stays bottom-right.

	Scene_RelationshipDetail.prototype.profileWindowRect = function() {
		const wx = 0;
		const wy = this.mainAreaTop();
		const ww = 360;
		const wh = this.mainAreaHeight();
		return new Rectangle(wx, wy, ww, wh);
	};

	Scene_RelationshipDetail.prototype.commandWindowRect = function() {
		const profile = this.profileWindowRect();
		const wx = profile.x + profile.width;
		const ww = Graphics.boxWidth - wx;
		const wh = this.calcWindowHeight(2, true);
		const wy = this.mainAreaTop() + this.mainAreaHeight() - wh;
		return new Rectangle(wx, wy, ww, wh);
	};

	Scene_RelationshipDetail.prototype.descriptionWindowRect = function() {
		const profile = this.profileWindowRect();
		const command = this.commandWindowRect();
		const wx = profile.x + profile.width;
		const wy = this.mainAreaTop();
		const ww = Graphics.boxWidth - wx;
		const wh = this.mainAreaHeight() - command.height;
		return new Rectangle(wx, wy, ww, wh);
	};

	Scene_RelationshipDetail.prototype.createProfileWindow = function() {
		this._profileWindow = new Window_RelationshipProfile(this.profileWindowRect(), this._key);
		this.addWindow(this._profileWindow);
	};

	Scene_RelationshipDetail.prototype.createDescriptionWindow = function() {
		this._descriptionWindow = new Window_RelationshipDescription(this.descriptionWindowRect(), this._key);
		this.addWindow(this._descriptionWindow);
	};

	Scene_RelationshipDetail.prototype.createCommandWindow = function() {
		this._commandWindow = new Window_RelationshipDetailCommand(this.commandWindowRect(), this._key);
		this._commandWindow.setHandler("playEvent", this.onPlayEvent.bind(this));
		this._commandWindow.setHandler("back", this.popScene.bind(this));
		this._commandWindow.setHandler("cancel", this.popScene.bind(this));
		this.addWindow(this._commandWindow);
	};

	Scene_RelationshipDetail.prototype.onPlayEvent = function() {
		if (triggerCharacterEvent(this._key)) {
			SceneManager.goto(Scene_Map);
		} else {
			SoundManager.playBuzzer();
			this._commandWindow.activate();
		}
	};

	// — Character cycling (v2.4.1) —
	//
	// Allows the player to navigate to the next/previous met character
	// without backing out to the list. Bound to both PgUp/PgDn (MZ's
	// convention for actor cycling in Status/Equip) and cursor Left/Right.
	// Cursor Left/Right are normally consumed by Window_Selectable's
	// processCursorMove, but Window_Command (the detail command window)
	// has maxCols=1, in which case cursorLeft/cursorRight are no-ops —
	// so checking Input.isTriggered at the scene level captures those
	// presses cleanly.
	//
	// On cycle: rebuild the in-memory met list (so newly-met characters
	// pick up), find the current key's index, wrap to the next/prev,
	// then refresh all three windows with the new key. No scene push/pop,
	// no fade — just an in-place re-render. The command window is
	// rebuilt so "Play Event" appears/disappears as appropriate for the
	// new character's pending state.

	Scene_RelationshipDetail.prototype.update = function() {
		Scene_MenuBase.prototype.update.call(this);
		if (this.isActive() && !this.isBusy()) {
			if (this._shouldCycleNext()) {
				this._cycleCharacter(1);
			} else if (this._shouldCyclePrevious()) {
				this._cycleCharacter(-1);
			}
		}
	};

	Scene_RelationshipDetail.prototype._shouldCycleNext = function() {
		return Input.isTriggered("pagedown") || Input.isTriggered("right");
	};

	Scene_RelationshipDetail.prototype._shouldCyclePrevious = function() {
		return Input.isTriggered("pageup") || Input.isTriggered("left");
	};

	Scene_RelationshipDetail.prototype._cycleCharacter = function(direction) {
		const metCharacters = characters.filter(c => $gameSystem.isMet(c.key));
		if (metCharacters.length <= 1) return; // Nothing to cycle to.
		const currentIndex = metCharacters.findIndex(c => c.key === this._key);
		if (currentIndex === -1) return; // Defensive — shouldn't happen.
		const len = metCharacters.length;
		const newIndex = (currentIndex + direction + len) % len;
		this._key = metCharacters[newIndex].key;
		this._refreshDetailWindows();
		SoundManager.playCursor();
	};

	// Update each window's stored key and refresh in place. The command
	// window's makeCommandList reads this._key to decide whether to add
	// the "Play Event" entry, and Window_Command.refresh rebuilds the
	// command list — so updating _key and calling refresh is sufficient.
	// Cursor is reset to the first command so the player doesn't end up
	// pointing at a command that no longer exists.
	Scene_RelationshipDetail.prototype._refreshDetailWindows = function() {
		this._profileWindow._key = this._key;
		this._profileWindow.refresh();
		this._descriptionWindow._key = this._key;
		this._descriptionWindow.refresh();
		this._commandWindow._key = this._key;
		this._commandWindow.refresh();
		this._commandWindow.select(0);
	};

	//-------------------------------------------------------------------------
	// Window_RelationshipProfile
	//
	// Combined face + stats panel on the left side of the detail scene.
	// Face is drawn at native 144×144 horizontally centered near the top;
	// stats sit beneath it (name, title, soulmate badge if applicable,
	// points/cap, within-tier progress or MAX, event-available callout).
	//
	// Uses ImageManager.loadFace + addLoadListener for the face — without
	// the listener, blt on an unloaded bitmap silently no-ops and the
	// face stays blank until something else triggers a refresh.
	//-------------------------------------------------------------------------

	function Window_RelationshipProfile() {
		this.initialize(...arguments);
	}

	Window_RelationshipProfile.prototype = Object.create(Window_Base.prototype);
	Window_RelationshipProfile.prototype.constructor = Window_RelationshipProfile;

	Window_RelationshipProfile.prototype.initialize = function(rect, key) {
		Window_Base.prototype.initialize.call(this, rect);
		this._key = key;
		this.refresh();
	};

	Window_RelationshipProfile.prototype.refresh = function() {
		this.contents.clear();
		const character = getCharacterConfig(this._key);
		if (!character) return;

		// Pre-compute total content height so we can vertically center
		// the face+stats block as a unit. Block consists of:
		//   - face (faceHeight + 12px gap) — always present as of v2.4.2
		//     (parser substitutes Actor1[0] for characters with no face)
		//   - name line (lineHeight + 12px gap)
		//   - title row (lineHeight)
		//   - rank pips row (lineHeight)
		//   - progress gauge (lineHeight)
		//   - event-available callout (lineHeight + 8px gap, if pending)
		const lineHeight = this.lineHeight();
		const hasPending = $gameSystem.hasPendingEvent(this._key);
		let blockHeight = ImageManager.faceHeight + 12; // face + gap
		blockHeight += lineHeight + 12; // name + gap
		blockHeight += lineHeight;      // title
		blockHeight += lineHeight;      // rank pips
		blockHeight += lineHeight;      // gauge
		if (hasPending) blockHeight += lineHeight + 8;

		const startY = Math.max(0, Math.floor((this.contents.height - blockHeight) / 2));

		const bitmap = ImageManager.loadFace(character.faceName);
		bitmap.addLoadListener(() => this.drawCharacterFace(startY));
		this.drawStats(startY);
	};

	Window_RelationshipProfile.prototype.drawCharacterFace = function(originY) {
		const character = getCharacterConfig(this._key);
		if (!character) return;
		const bitmap = ImageManager.loadFace(character.faceName);
		const fw = ImageManager.faceWidth;
		const fh = ImageManager.faceHeight;
		const sx = Math.floor((character.faceIndex % 4) * fw);
		const sy = Math.floor(Math.floor(character.faceIndex / 4) * fh);
		const dx = Math.floor((this.contents.width - fw) / 2);
		const dy = originY || 0;
		this.contents.blt(bitmap, sx, sy, fw, fh, dx, dy);
	};

	Window_RelationshipProfile.prototype.drawStats = function(originY) {
		const character = getCharacterConfig(this._key);
		if (!character) return;

		const key = this._key;
		const lineHeight = this.lineHeight();
		const labelWidth = 120;
		const valueX = labelWidth + 16;
		const valueWidth = this.contents.width - valueX;
		const isSoulmate = $gameSystem.isSoulmate(key);
		// Stats start below the face area. A face is always present as of
		// v2.4.2 (parser substitutes Actor1[0] fallback when no face is set).
		let y = (originY || 0) + ImageManager.faceHeight + 12;

		// Display name (slightly larger). For a soulmate, color the name
		// with the configured palette index and append a heart.
		const baseFontSize = $gameSystem.mainFontSize();
		this.contents.fontSize = baseFontSize + 8;
		const nameText = isSoulmate ? `${character.displayName} \u2665` : character.displayName;
		if (isSoulmate) {
			this.changeTextColor(ColorManager.textColor(soulmateColor));
		} else {
			this.resetTextColor();
		}
		this.drawText(nameText, 0, y, this.contents.width, "left");
		this.resetTextColor();
		y += lineHeight + 12;
		this.contents.fontSize = baseFontSize;

		// Title.
		this.changeTextColor(ColorManager.systemColor());
		this.drawText("Title:", 0, y, labelWidth, "left");
		this.resetTextColor();
		this.drawText($gameSystem.getRelationshipTitleName(key), valueX, y, valueWidth, "left");
		y += lineHeight;

		// Rank pips: filled circles for events that have played, empty
		// for the rest. Reachable thresholds only — 5 for non-soulmates
		// (100/200/300/400/500), 7 for soulmates (adds 600/700). A
		// threshold is "completed" when nextEventThreshold has advanced
		// past it. Filled circle uses the gauge color; unfilled uses the
		// gauge backdrop color (dimmer than default text, for contrast).
		const thresholds = isSoulmate
			? [100, 200, 300, 400, 500, 600, 700]
			: [100, 200, 300, 400, 500];
		const nextEvent = $gameSystem.getNextEventThreshold(key);
		// nextEvent past cap (e.g. 600 for non-soulmate, 800 for soulmate)
		// means all events are done — treat all thresholds as completed.
		const cap = isSoulmate ? soulmateCap : nonSoulmateCap;
		const allDone = nextEvent === null || nextEvent > cap;
		this.changeTextColor(ColorManager.systemColor());
		this.drawText("Rank:", 0, y, labelWidth, "left");
		this.resetTextColor();
		// Adaptive pip sizing: compute available width and size each pip
		// to fit on one line. With 7 soulmate pips and a 360px profile
		// window, the baseFontSize+4 sizing overflowed; now we shrink
		// to fit, clamped between baseFontSize and baseFontSize+8 so
		// pips never look microscopic or oversized.
		const filledColor = ColorManager.textColor(gaugeColor);
		const emptyColor = ColorManager.gaugeBackColor();
		const availablePipWidth = this.contents.width - valueX;
		const pipGap = 8;
		// Each pip needs glyphWidth + pipGap. Glyph width scales roughly
		// linearly with font size. Estimate the per-glyph width at the
		// upper-bound font size, then shrink if needed.
		const maxFontSize = baseFontSize + 8;
		const minFontSize = baseFontSize;
		// Iteratively pick the largest fontSize at which all pips fit.
		// Cheap because there's only a 9-step range to scan and each
		// step costs one measureTextWidth call.
		let pipFontSize = maxFontSize;
		for (let candidate = maxFontSize; candidate >= minFontSize; candidate--) {
			this.contents.fontSize = candidate;
			const candidateGlyphWidth = this.contents.measureTextWidth("\u25CF");
			const totalWidth = thresholds.length * (candidateGlyphWidth + pipGap);
			if (totalWidth <= availablePipWidth) {
				pipFontSize = candidate;
				break;
			}
			// If even minFontSize overflows, accept it and let the right
			// edge clip — better than nothing.
			if (candidate === minFontSize) pipFontSize = minFontSize;
		}
		this.contents.fontSize = pipFontSize;
		let pipX = valueX;
		for (const threshold of thresholds) {
			const completed = allDone || (nextEvent !== null && threshold < nextEvent);
			const glyph = completed ? "\u25CF" : "\u25CB"; // ● vs ○
			this.changeTextColor(completed ? filledColor : emptyColor);
			// Measure each glyph individually since proportional font may
			// give slightly different widths for ● and ○.
			const glyphWidth = this.contents.measureTextWidth(glyph);
			this.drawText(glyph, pipX, y, glyphWidth + 4, "left");
			pipX += glyphWidth + pipGap;
		}
		this.resetTextColor();
		this.contents.fontSize = baseFontSize;
		y += lineHeight;

		// Within-tier progress, or MAX. Gauge with label centered over
		// it (always shown, even at MAX — fully filled with "MAX" text).
		this.changeTextColor(ColorManager.systemColor());
		this.drawText("Progress:", 0, y, labelWidth, "left");
		this.resetTextColor();
		const gaugeWidth = Math.min(200, this.contents.width - valueX);
		const gaugeHeight = 18;
		const gaugeY = y + Math.floor((lineHeight - gaugeHeight) / 2);
		let rate, label;
		if (allDone) {
			rate = 1;
			label = "MAX";
		} else {
			const points = $gameSystem.getRelationshipPoints(key);
			const lastEvent = nextEvent - pointsPerTier;
			const within = Math.max(0, Math.min(pointsPerTier, points - lastEvent));
			rate = within / pointsPerTier;
			label = `${within} / ${pointsPerTier}`;
		}
		drawProgressGauge(this, valueX, gaugeY, gaugeWidth, gaugeHeight, rate, label);
		y += lineHeight;

		// Event-available callout.
		if ($gameSystem.hasPendingEvent(key)) {
			y += 8;
			this.changeTextColor(ColorManager.powerUpColor());
			this.drawText(`Event Available ${eventAvailableMarker}`, 0, y, this.contents.width, "left");
			this.resetTextColor();
		}
	};

	//-------------------------------------------------------------------------
	// Window_RelationshipDescription
	//
	// Free-form text panel on the upper-right. Renders text codes
	// (\C[n], \I[n], \V[n], \N[n], etc.) via drawTextEx, with word-wrap
	// that respects the codes — text is tokenized, wrapped on word
	// boundaries, then each line is drawn with its own drawTextEx call
	// so codes still resolve correctly.
	//
	// Variable (\V[n]) and actor (\N[n]) substitutions are expanded at
	// refresh time so wrap measurement reflects the actual displayed
	// width. Icons (\I[n]) are treated as 32px-wide atoms. Other codes
	// (color, font-size, pauses, etc.) are zero-advance and pass through
	// the wrap unchanged.
	//
	// Overflow: if wrapped text exceeds the window's height, lines below
	// the bottom edge clip silently. No internal scrolling.
	//
	// Reads from $gameSystem.getRelationshipDescription, which returns
	// the runtime override if one has been set or the configured
	// plugin-param description otherwise. Empty/blank descriptions
	// render an empty window (no placeholder), consistent with the rest
	// of the plugin.
	//-------------------------------------------------------------------------

	function Window_RelationshipDescription() {
		this.initialize(...arguments);
	}

	Window_RelationshipDescription.prototype = Object.create(Window_Base.prototype);
	Window_RelationshipDescription.prototype.constructor = Window_RelationshipDescription;

	Window_RelationshipDescription.prototype.initialize = function(rect, key) {
		Window_Base.prototype.initialize.call(this, rect);
		this._key = key;
		this.refresh();
	};

	Window_RelationshipDescription.prototype.refresh = function() {
		this.contents.clear();
		if (!this._key) return;
		const text = $gameSystem.getRelationshipDescription(this._key);
		if (!text) return;
		const expanded = this._expandSubstitutions(text);
		const lines = this._wrapText(expanded, this.contents.width);
		const lineHeight = this.lineHeight();
		for (let i = 0; i < lines.length; i++) {
			const y = i * lineHeight;
			// Stop drawing once we've exceeded the window's content
			// height — silent clip rather than draw-then-overflow.
			if (y + lineHeight > this.contents.height) break;
			this.drawTextEx(lines[i], 0, y, this.contents.width);
		}
	};

	// Pre-expand \V[n] (variable values) and \N[n] (actor names) so the
	// wrap measurement reflects the rendered width. The replacements use
	// the same logic Window_Base's text-code processor would: \V reads
	// $gameVariables, \N reads $gameActors. Done with regex since these
	// codes have a regular structure and we never need to nest them.
	Window_RelationshipDescription.prototype._expandSubstitutions = function(text) {
		let result = String(text);
		result = result.replace(/\\V\[(\d+)\]/gi, (_, n) => $gameVariables.value(Number(n)));
		result = result.replace(/\\N\[(\d+)\]/gi, (_, n) => {
			const actor = $gameActors.actor(Number(n));
			return actor ? actor.name() : "";
		});
		return result;
	};

	// Tokenize the source into a stream of tokens, then greedy-pack
	// tokens onto lines. Returns an array of line strings — each is
	// safe to pass to drawTextEx and will render with all its codes
	// intact.
	//
	// Token types:
	//   {kind: 'text',     raw, width}     — printable run, width in px
	//   {kind: 'code',     raw, width}     — escape sequence (e.g. \C[3])
	//   {kind: 'icon',     raw, width: 32} — \I[n], width fixed at 32
	//   {kind: 'space',    raw, width}     — single space (break point)
	//   {kind: 'newline',  raw}            — explicit \n
	Window_RelationshipDescription.prototype._wrapText = function(text, maxWidth) {
		const tokens = this._tokenize(text);
		const lines = [];
		let currentLine = "";
		let currentWidth = 0;
		// Track trailing-space token so wrap-on-overflow knows where
		// the last break opportunity was inside currentLine.
		const flush = () => {
			lines.push(currentLine);
			currentLine = "";
			currentWidth = 0;
		};
		for (const tok of tokens) {
			if (tok.kind === "newline") {
				flush();
				continue;
			}
			if (tok.kind === "space") {
				// Don't put a space at the start of a fresh line.
				if (currentLine.length === 0) continue;
				if (currentWidth + tok.width > maxWidth) {
					flush();
					continue;
				}
				currentLine += tok.raw;
				currentWidth += tok.width;
				continue;
			}
			// text, code, or icon: try to fit on the current line.
			if (currentWidth + tok.width > maxWidth && currentLine.length > 0) {
				// Break before this token. Trim any trailing whitespace
				// from the current line so wrapped lines don't end with
				// a stranded space.
				currentLine = currentLine.replace(/\s+$/, "");
				flush();
			}
			currentLine += tok.raw;
			currentWidth += tok.width;
		}
		if (currentLine.length > 0 || lines.length === 0) {
			lines.push(currentLine);
		}
		return lines;
	};

	Window_RelationshipDescription.prototype._tokenize = function(text) {
		const tokens = [];
		const src = String(text);
		const measurer = new Bitmap(1, 1);
		measurer.fontFace = $gameSystem.mainFontFace();
		measurer.fontSize = $gameSystem.mainFontSize();

		let i = 0;
		let textRun = "";
		const flushTextRun = () => {
			if (textRun.length === 0) return;
			tokens.push({
				kind: "text",
				raw: textRun,
				width: measurer.measureTextWidth(textRun)
			});
			textRun = "";
		};
		while (i < src.length) {
			const ch = src[i];
			if (ch === "\n") {
				flushTextRun();
				tokens.push({ kind: "newline", raw: "\n" });
				i++;
				continue;
			}
			if (ch === " " || ch === "\t") {
				flushTextRun();
				tokens.push({
					kind: "space",
					raw: " ",
					width: measurer.measureTextWidth(" ")
				});
				i++;
				continue;
			}
			if (ch === "\\") {
				// Escape sequence. Recognize patterns of the form:
				//   \X[n]   — single-letter code with [number] arg
				//   \X      — bare single-letter code
				// We don't validate which letter; any \X-form is treated
				// as a code. Width is 32 for \I (icon), 0 for everything
				// else.
				flushTextRun();
				const codeMatch = /^\\([A-Za-z])(?:\[(-?\d+)\])?/.exec(src.slice(i));
				if (codeMatch) {
					const letter = codeMatch[1].toUpperCase();
					const raw = codeMatch[0];
					const width = letter === "I" ? 32 : 0;
					tokens.push({ kind: letter === "I" ? "icon" : "code", raw, width });
					i += raw.length;
					continue;
				}
				// Backslash escapes for special characters like \{ \} \! \. \|
				// — single-char codes with no number argument. Match the
				// next single non-alphabetic character as a code.
				const punctMatch = /^\\(.)/.exec(src.slice(i));
				if (punctMatch) {
					tokens.push({ kind: "code", raw: punctMatch[0], width: 0 });
					i += punctMatch[0].length;
					continue;
				}
				// Lone trailing backslash — treat as text.
				textRun += ch;
				i++;
				continue;
			}
			textRun += ch;
			i++;
		}
		flushTextRun();
		return tokens;
	};

	//-------------------------------------------------------------------------
	// Window_RelationshipDetailCommand
	//
	// Conditional command list: "Play Event" only when an event is
	// pending for this character; "Back" always.
	//-------------------------------------------------------------------------

	function Window_RelationshipDetailCommand() {
		this.initialize(...arguments);
	}

	Window_RelationshipDetailCommand.prototype = Object.create(Window_Command.prototype);
	Window_RelationshipDetailCommand.prototype.constructor = Window_RelationshipDetailCommand;

	Window_RelationshipDetailCommand.prototype.initialize = function(rect, key) {
		// Set the key BEFORE super.initialize, because Window_Command's
		// initialize calls makeCommandList which reads it.
		this._key = key;
		Window_Command.prototype.initialize.call(this, rect);
	};

	Window_RelationshipDetailCommand.prototype.makeCommandList = function() {
		if (this._key && $gameSystem.hasPendingEvent(this._key)) {
			this.addCommand("Play Event", "playEvent");
		}
		this.addCommand("Back", "back");
	};

	//-------------------------------------------------------------------------
	// Window_RelationshipToast (v2.4)
	//
	// Bottom-right notification window. Self-managing lifecycle:
	//   fade-in (TOAST_FADE_IN_FRAMES) → hold (toastDwellFrames) → fade-out (TOAST_FADE_OUT_FRAMES)
	// Reports "done" via isFinished() once it has completely faded out.
	// Scene_Map polls a single active toast; new ones queue serially.
	//
	// Rendering: face on the left at 72×72 (half-scale of the standard
	// 144×144 face), plain text on the right with word-wrap. Text codes
	// are NOT supported in toast messages (the wrap pass uses plain-text
	// measurement via textWidth, which doesn't reason about \C[n]/\I[n]).
	// Width is configurable; height grows to fit wrapped text, with a
	// minimum equal to the face size.
	//
	// Position: bottom-right, anchored from the bottom edge so taller
	// toasts grow upward (the bottom edge stays at the same Y across
	// toasts of different lengths).
	//-------------------------------------------------------------------------

	function Window_RelationshipToast() {
		this.initialize(...arguments);
	}

	Window_RelationshipToast.prototype = Object.create(Window_Base.prototype);
	Window_RelationshipToast.prototype.constructor = Window_RelationshipToast;

	Window_RelationshipToast.FACE_SIZE = 72;
	Window_RelationshipToast.INNER_PADDING = 12;
	Window_RelationshipToast.FACE_TEXT_GAP = 12;

	// Static word-wrap helper. Splits `text` on whitespace, greedily
	// packs words onto lines until the next word would exceed maxWidth,
	// returns an array of line strings. Uses a Bitmap's measureTextWidth
	// for accuracy with the current default font. Words longer than
	// maxWidth (e.g. URLs) get their own line and overflow — acceptable
	// for short toast messages.
	Window_RelationshipToast.wrapText = function(text, maxWidth) {
		const measurer = new Bitmap(1, 1);
		measurer.fontFace = $gameSystem.mainFontFace();
		measurer.fontSize = $gameSystem.mainFontSize();
		const words = String(text).split(/\s+/).filter(w => w.length > 0);
		const lines = [];
		let currentLine = "";
		for (const word of words) {
			const candidate = currentLine ? currentLine + " " + word : word;
			if (measurer.measureTextWidth(candidate) <= maxWidth) {
				currentLine = candidate;
			} else {
				if (currentLine) lines.push(currentLine);
				currentLine = word;
			}
		}
		if (currentLine) lines.push(currentLine);
		return lines.length > 0 ? lines : [""];
	};

	Window_RelationshipToast.prototype.initialize = function(key) {
		const character = getCharacterConfig(key);
		const faceSize = Window_RelationshipToast.FACE_SIZE;
		const innerPadding = Window_RelationshipToast.INNER_PADDING;
		const faceTextGap = Window_RelationshipToast.FACE_TEXT_GAP;

		// Decide whether a face will actually render. Since v2.4.2, the
		// parser substitutes a fallback face (Actor1[0]) for characters
		// with no configured face, so faceName is guaranteed non-empty
		// for any valid character. The render decision now depends only
		// on the toastShowFace plugin param.
		const drawsFace = toastShowFace && !!character;

		// Pre-compute wrapped lines so we can size the window to fit.
		// Window frame eats ~18px on each side for the standard MZ
		// window padding; the text area is what's left after subtracting
		// face area + gap (when a face is shown).
		const framePadding = 18;
		const innerWidth = toastWidth - framePadding * 2;
		const textAreaX = drawsFace ? (faceSize + faceTextGap) : 0;
		const textAreaWidth = innerWidth - textAreaX;
		const messageText = toastMessage.replace(/%1/g, character ? character.displayName : key);
		const lines = Window_RelationshipToast.wrapText(messageText, textAreaWidth);

		// Compute height to fit wrapped text. When the face is shown, use
		// a faceSize floor so a one-line toast still looks balanced next
		// to the face; without a face, height tracks the text block
		// exactly (no dead space).
		const defaultLineHeight = 36;
		const textBlockHeight = lines.length * defaultLineHeight;
		const contentHeight = drawsFace ? Math.max(faceSize, textBlockHeight) : textBlockHeight;
		const height = contentHeight + innerPadding * 2;

		// Anchor position based on the configured corner. Margins are
		// measured from the chosen corner inward.
		let x, y;
		switch (toastPosition) {
			case "topleft":
				x = toastMarginX;
				y = toastMarginY;
				break;
			case "topright":
				x = Graphics.boxWidth - toastWidth - toastMarginX;
				y = toastMarginY;
				break;
			case "bottomleft":
				x = toastMarginX;
				y = Graphics.boxHeight - height - toastMarginY;
				break;
			case "bottomright":
			default:
				x = Graphics.boxWidth - toastWidth - toastMarginX;
				y = Graphics.boxHeight - height - toastMarginY;
				break;
		}
		const rect = new Rectangle(x, y, toastWidth, height);
		Window_Base.prototype.initialize.call(this, rect);

		this._key = key;
		this._character = character;
		this._lines = lines;
		this._drawsFace = drawsFace;
		this._phase = "fadeIn";
		this._phaseTimer = 0;
		this.opacity = 0;
		this.contentsOpacity = 0;
		this.backOpacity = 0;
		this.refresh();
	};

	Window_RelationshipToast.prototype.refresh = function() {
		this.contents.clear();
		if (!this._character) return;
		const faceSize = Window_RelationshipToast.FACE_SIZE;
		const faceTextGap = Window_RelationshipToast.FACE_TEXT_GAP;
		// Draw face only if both the plugin param allows it and the
		// character has a face configured. The _drawsFace flag is cached
		// from initialize so layout stays consistent with the window size.
		if (this._drawsFace) {
			const bitmap = ImageManager.loadFace(this._character.faceName);
			bitmap.addLoadListener(() => this._drawFace());
		}
		// Draw wrapped lines stacked vertically. Text starts at x=0 when
		// no face is shown (full width), or at faceSize+gap when one is.
		const textX = this._drawsFace ? (faceSize + faceTextGap) : 0;
		const textWidth = this.contents.width - textX;
		const lineHeight = this.lineHeight();
		const textBlockHeight = this._lines.length * lineHeight;
		const startY = Math.max(0, Math.floor((this.contents.height - textBlockHeight) / 2));
		for (let i = 0; i < this._lines.length; i++) {
			this.drawText(this._lines[i], textX, startY + i * lineHeight, textWidth, "left");
		}
	};

	Window_RelationshipToast.prototype._drawFace = function() {
		if (!this._drawsFace) return;
		if (!this._character) return;
		const bitmap = ImageManager.loadFace(this._character.faceName);
		const srcSize = ImageManager.faceWidth;
		const sx = Math.floor((this._character.faceIndex % 4) * srcSize);
		const sy = Math.floor(Math.floor(this._character.faceIndex / 4) * srcSize);
		const dstSize = Window_RelationshipToast.FACE_SIZE;
		// Center the face vertically within the contents area so taller
		// toasts (more wrapped lines) put the face in the middle rather
		// than pinned to the top.
		const dy = Math.max(0, Math.floor((this.contents.height - dstSize) / 2));
		this.contents.blt(bitmap, sx, sy, srcSize, srcSize, 0, dy, dstSize, dstSize);
	};

	Window_RelationshipToast.prototype.update = function() {
		Window_Base.prototype.update.call(this);
		this._phaseTimer++;
		if (this._phase === "fadeIn") {
			const t = Math.min(1, this._phaseTimer / TOAST_FADE_IN_FRAMES);
			this.opacity = Math.floor(255 * t);
			this.contentsOpacity = Math.floor(255 * t);
			this.backOpacity = Math.floor(192 * t);
			if (this._phaseTimer >= TOAST_FADE_IN_FRAMES) {
				this._phase = "hold";
				this._phaseTimer = 0;
				this.opacity = 255;
				this.contentsOpacity = 255;
				this.backOpacity = 192;
			}
		} else if (this._phase === "hold") {
			if (this._phaseTimer >= toastDwellFrames) {
				this._phase = "fadeOut";
				this._phaseTimer = 0;
			}
		} else if (this._phase === "fadeOut") {
			const t = Math.min(1, this._phaseTimer / TOAST_FADE_OUT_FRAMES);
			this.opacity = Math.floor(255 * (1 - t));
			this.contentsOpacity = Math.floor(255 * (1 - t));
			this.backOpacity = Math.floor(192 * (1 - t));
			if (this._phaseTimer >= TOAST_FADE_OUT_FRAMES) {
				this._phase = "done";
			}
		}
	};

	Window_RelationshipToast.prototype.isFinished = function() {
		return this._phase === "done";
	};

	//-------------------------------------------------------------------------
	// Scene_Map — toast queue runner (v2.4)
	//
	// On each frame, Scene_Map checks for:
	//   1. An active toast that has finished its lifecycle → remove it.
	//   2. No active toast AND a queued toast AND suppression clear → spawn.
	//
	// Suppression checks (any one blocks toast display):
	//   - $gameMessage.isBusy() — message window is active
	//   - $gameMap.isEventRunning() — interpreter is running an event
	//   - $gameSystem.getReturnPoint() — player is inside a relationship event map
	//   - $gamePlayer.isTransferring() — transfer reserved but not yet
	//     completed. Closes the window between returnFromEvent clearing
	//     the return point and the transfer actually firing, during
	//     which a queued toast could otherwise spawn on the event map.
	//
	// The queue persists on $gameSystem so a toast queued during an
	// event will surface when the player returns to a normal map.
	//-------------------------------------------------------------------------

	const _Scene_Map_update = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function() {
		_Scene_Map_update.call(this);
		this._updateRelationshipToast();
	};

	Scene_Map.prototype._updateRelationshipToast = function() {
		// Step 1: retire a finished toast.
		if (this._relationshipToastWindow) {
			if (this._relationshipToastWindow.isFinished()) {
				this._windowLayer.removeChild(this._relationshipToastWindow);
				this._relationshipToastWindow = null;
			} else {
				return; // Active toast in progress — don't spawn another.
			}
		}

		// Step 2: check the queue.
		if (!$gameSystem || !$gameSystem.hasQueuedToast()) return;

		// Step 3: suppression. Don't surface a toast during messages,
		// running events, while inside a relationship event map, or
		// while a transfer is pending. The isTransferring check closes
		// the v2.4 window where returnFromEvent had already cleared the
		// return point but the transfer hadn't yet fired — a toast
		// could spawn on the event map in that gap.
		if ($gameMessage.isBusy()) return;
		if ($gameMap.isEventRunning()) return;
		if ($gameSystem.getReturnPoint()) return;
		if ($gamePlayer.isTransferring()) return;

		// Step 4: dequeue and spawn.
		const entry = $gameSystem.dequeueToast();
		if (!entry) return;
		this._spawnRelationshipToast(entry.key);
	};

	Scene_Map.prototype._spawnRelationshipToast = function(key) {
		const character = getCharacterConfig(key);
		if (!character) return;
		this._relationshipToastWindow = new Window_RelationshipToast(key);
		this._windowLayer.addChild(this._relationshipToastWindow);
		// Play SE alongside the fade-in.
		if (toastSe) {
			AudioManager.playSe({
				name: toastSe,
				volume: toastSeVolume,
				pitch: 100,
				pan: 0
			});
		}
	};

	//-------------------------------------------------------------------------
	// Plugin Commands
	//-------------------------------------------------------------------------

	PluginManager.registerCommand(PLUGIN_NAME, "addPoints", args => {
		const key = String(args.key || "");
		const amount = Number(args.amount || 0);
		if (key) $gameSystem.addRelationshipPoints(key, amount);
	});

	PluginManager.registerCommand(PLUGIN_NAME, "setPoints", args => {
		const key = String(args.key || "");
		const amount = Number(args.amount || 0);
		if (key) $gameSystem.setRelationshipPoints(key, amount);
	});

	PluginManager.registerCommand(PLUGIN_NAME, "meetCharacter", args => {
		const key = String(args.key || "");
		if (!key) return;
		if (!getCharacterConfig(key)) {
			console.warn(`${PLUGIN_NAME}: meetCharacter called with unknown key "${key}"`);
			return;
		}
		$gameSystem.meetCharacter(key);
	});

	PluginManager.registerCommand(PLUGIN_NAME, "playCharacterEvent", args => {
		const key = String(args.key || "");
		triggerCharacterEvent(key);
	});

	PluginManager.registerCommand(PLUGIN_NAME, "returnFromEvent", () => {
		const returnPoint = $gameSystem.getReturnPoint();
		if (!returnPoint) {
			console.warn(`${PLUGIN_NAME}: returnFromEvent called but no return point saved`);
			return;
		}

		// Tier-up notification (Persona-style): fire SE and queue the
		// message HERE — after the event content has played, before the
		// transfer back. Message goes through $gameMessage so the player
		// dismisses it with the action button before the transfer fires
		// (Scene_Map.updateTransferPlayer is gated on !isBusy()).
		// Clears the pending flag so subsequent returns don't replay it.
		const pending = $gameSystem._pendingTierUpNotification;
		if (pending) {
			playTierUpSe();
			if (tierUpMessage) {
				const text = tierUpMessage
					.replace(/%1/g, pending.displayName)
					.replace(/%2/g, pending.titleName);
				$gameMessage.add(text);
			}
			$gameSystem._pendingTierUpNotification = null;
		}

		// Toast re-detection (v2.4.1, moved here from advanceCharacterEvent).
		// If the character's points already qualify them for the NEXT event
		// (e.g. they had 250 points, just played the 100 event, now their
		// nextEventThreshold is 200 and 250 ≥ 200), queue a toast for that
		// new pending state. Calling here — after the tier-up message is
		// queued but before reserveTransfer — means the toast is enqueued
		// at the latest possible moment, with $gameMessage.isBusy() still
		// true and the return point still set. The toast won't surface
		// until the player is back on the home map and all suppression
		// gates clear. Legacy v2.4 return points may lack the key field.
		if (returnPoint.key) {
			$gameSystem._maybeQueueToast(returnPoint.key, false);
		}

		$gamePlayer.reserveTransfer(
			returnPoint.mapId,
			returnPoint.x,
			returnPoint.y,
			returnPoint.direction,
			0
		);
		$gameSystem.clearReturnPoint();
	});

	PluginManager.registerCommand(PLUGIN_NAME, "setSoulmate", args => {
		const key = String(args.key || "");
		if (!key) return;
		if (!getCharacterConfig(key)) {
			console.warn(`${PLUGIN_NAME}: setSoulmate called with unknown key "${key}"`);
			return;
		}
		$gameSystem.setSoulmate(key);
	});

	PluginManager.registerCommand(PLUGIN_NAME, "setDescription", args => {
		const key = String(args.key || "");
		if (!key) return;
		if (!getCharacterConfig(key)) {
			console.warn(`${PLUGIN_NAME}: setDescription called with unknown key "${key}"`);
			return;
		}
		// `multiline_string` arrives as a plain string already — no extra
		// JSON layer to unwrap, unlike the @type note parameter case.
		const text = args.text == null ? "" : String(args.text);
		$gameSystem.setRelationshipDescription(key, text);
	});

})();
