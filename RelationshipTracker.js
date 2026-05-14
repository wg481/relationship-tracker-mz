// If you have paid for this software, you have been SCAMMED!!!
//=============================================================================
// RelationshipTracker.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc v2.2.0-beta Merges portrait+info into one profile window and adds editable character descriptions with text-code support.
 * @author wg481 and Claude
 *
 * @param menuCommandLabel
 * @text Menu Command Label
 * @type string
 * @desc Text shown for the new command in the main menu.
 * @default Relationships
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
 * to (0, 0) facing down with a black fade. The convention is for the
 * event map's autorun to position the player and call Fadein Screen
 * itself, giving you full control over the entry beat.
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
 * The description window does NOT auto-wrap text on width. Insert
 * line breaks yourself; long single lines will spill off the right
 * edge of the panel.
 *
 * Example description:
 *   \C[2]Demon, daughter of Ba'al.\C[0]
 *   Found in the slums of Verras after the temple collapse.
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
 * Soulmate. Only one character can be soulmate at a time — enforcement
 * is the event author's job for now (use $gameSystem.getCurrentSoulmate()
 * to check before calling Set Soulmate).
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
 *    become soulmates, call "Set Soulmate" (gated by a conditional that
 *    checks getCurrentSoulmate() === null if you want to enforce
 *    exclusivity).
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
 * - Soulmate exclusivity is NOT enforced by the plugin. Calling
 *   Set Soulmate on a second character will mark both as soulmate.
 *   Use getCurrentSoulmate() in a conditional branch to gate the choice.
 * - Event maps teleport the player to (0, 0) facing down with a black
 *   fade. Author each event map's autorun to position the player and
 *   call Fadein Screen at the desired speed.
 *
 * ─── Terms of Use ────────────────────────────────────────
 * Free for commercial and non-commercial use. Credit appreciated.
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
 * @param eventMap200
 * @text 200-Point Event Map
 * @type number
 * @min 0
 * @desc Map ID for the 200-point event (advances title to Friends). 0 = not configured.
 * @default 0
 *
 * @param eventMap300
 * @text 300-Point Event Map
 * @type number
 * @min 0
 * @desc Map ID for the 300-point event (advances title to Close Friends). 0 = not configured.
 * @default 0
 *
 * @param eventMap400
 * @text 400-Point Event Map
 * @type number
 * @min 0
 * @desc Map ID for the 400-point event (advances title to Best Friends). 0 = not configured.
 * @default 0
 *
 * @param eventMap500
 * @text 500-Point Event Map
 * @type number
 * @min 0
 * @desc Map ID for the 500-point choice event. Use a conditional branch + Set Soulmate inside. 0 = not configured.
 * @default 0
 *
 * @param eventMap600
 * @text 600-Point Event Map
 * @type number
 * @min 0
 * @desc Map ID for the 600-point soulmate-only event. 0 = not configured.
 * @default 0
 *
 * @param eventMap700
 * @text 700-Point Event Map
 * @type number
 * @min 0
 * @desc Map ID for the 700-point soulmate-only event. 0 = not configured.
 * @default 0
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
	const pointsPerTier = Math.max(1, Number(params.pointsPerTier || 100));
	const showSwitchId = Number(params.showSwitchId || 0);
	const eventAvailableMarker = String(params.eventAvailableMarker || "!");

	const titleNames = (() => {
		try {
			const arr = JSON.parse(params.titleNames || "[]");
			return arr.map(s => String(s));
		} catch (e) {
			console.error(`${PLUGIN_NAME}: failed to parse titleNames`, e);
			return [];
		}
	})();

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
				return {
					key: String(obj.key || ""),
					displayName: String(obj.displayName || obj.key || ""),
					faceName: String(obj.faceName || ""),
					faceIndex: Number(obj.faceIndex || 0),
					description: description,
					eventMaps: {
						100: Number(obj.eventMap100 || 0),
						200: Number(obj.eventMap200 || 0),
						300: Number(obj.eventMap300 || 0),
						400: Number(obj.eventMap400 || 0),
						500: Number(obj.eventMap500 || 0),
						600: Number(obj.eventMap600 || 0),
						700: Number(obj.eventMap700 || 0)
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

	// Shared by the playCharacterEvent plugin command and the detail
	// scene's Play Event command. Returns true if the transfer was
	// queued, false if anything blocked it (no pending event, missing
	// map ID, unknown key).
	function triggerCharacterEvent(key) {
		if (!key) return false;
		if (!$gameSystem.hasPendingEvent(key)) {
			console.warn(`${PLUGIN_NAME}: triggerCharacterEvent called for "${key}" but no event is pending`);
			return false;
		}
		const character = getCharacterConfig(key);
		if (!character) return false;
		const threshold = $gameSystem.getNextEventThreshold(key);
		const mapId = character.eventMaps[threshold];
		if (!mapId || mapId <= 0) {
			console.warn(`${PLUGIN_NAME}: no event map configured for "${key}" at threshold ${threshold}`);
			return false;
		}
		$gameSystem.saveReturnPoint();
		$gameSystem.advanceCharacterEvent(key);
		// Land at (0, 0) facing down with a black fade. The event map's
		// autorun is expected to reposition the player and fade in.
		$gamePlayer.reserveTransfer(mapId, 0, 0, 2, 0);
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
				description: null
			};
		} else if (this._relationshipData[key].description === undefined) {
			// Backfill for saves made with v2.0/v2.1 (pre-description).
			this._relationshipData[key].description = null;
		}
		return this._relationshipData[key];
	};

	// — Points —

	Game_System.prototype.getRelationshipPoints = function(key) {
		return this._ensureCharacterData(key).points;
	};

	Game_System.prototype.setRelationshipPoints = function(key, value) {
		const data = this._ensureCharacterData(key);
		data.points = clampPoints(key, value);
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

	// Backward-compat aliases (v1.0.0 names). IF YOU HAVE PAID FOR THIS SOFTWARE, YOU HAVE BEEN SCAMMED.
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
		const mapId = character.eventMaps[data.nextEventThreshold];
		return mapId > 0;
	};

	Game_System.prototype.meetCharacter = function(key) {
		const data = this._ensureCharacterData(key);
		if (data.met) return; // Idempotent — calling twice should not regress state.
		data.met = true;
		data.titleIndex = 0;
		data.nextEventThreshold = pointsPerTier;
	};

	Game_System.prototype.setSoulmate = function(key) {
		const data = this._ensureCharacterData(key);
		if (!data.met) {
			console.warn(`${PLUGIN_NAME}: setSoulmate called on unmet character "${key}"`);
			return;
		}
		data.isSoulmate = true;
		data.titleIndex = TITLE_SOULMATE_INDEX;
	};

	Game_System.prototype.advanceCharacterEvent = function(key) {
		// Called by the Play Character Event plugin command. Advances
		// titleIndex (only for thresholds below the choice threshold) and
		// bumps nextEventThreshold by pointsPerTier. State updates happen
		// BEFORE the teleport so the event map sees the new title.
		const data = this._ensureCharacterData(key);
		const threshold = data.nextEventThreshold;
		if (threshold === null) return;

		if (threshold < choiceThreshold) {
			data.titleIndex = Math.floor(threshold / pointsPerTier);
		}
		// At/above choiceThreshold: title is changed by setSoulmate() if
		// the player chooses soulmate; otherwise it stays at Best Friends.

		data.nextEventThreshold = threshold + pointsPerTier;
	};

	// — Return point —

	Game_System.prototype.saveReturnPoint = function() {
		this._relationshipReturnPoint = {
			mapId: $gameMap.mapId(),
			x: $gamePlayer.x,
			y: $gamePlayer.y,
			direction: $gamePlayer.direction()
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

	Window_RelationshipList.prototype.drawItem = function(index) {
		const character = this._metCharacters[index];
		if (!character) return;

		const rect = this.itemLineRect(index);
		const key = character.key;
		const points = $gameSystem.getRelationshipPoints(key);
		const titleIdx = $gameSystem.getRelationshipTitleIndex(key);
		const titleName = titleNames[titleIdx] || "";
		const nextEvent = $gameSystem.getNextEventThreshold(key);
		const cap = $gameSystem.isSoulmate(key) ? soulmateCap : nonSoulmateCap;
		const pending = $gameSystem.hasPendingEvent(key);

		let rankText;
		if (nextEvent === null || nextEvent > cap) {
			// No further events possible — character is at their ceiling.
			rankText = `${titleName} \u2014 MAX`;
		} else {
			const lastEvent = nextEvent - pointsPerTier;
			const within = Math.max(0, Math.min(pointsPerTier, points - lastEvent));
			rankText = `${titleName} \u2014 ${within}/${pointsPerTier}`;
		}

		if (pending) {
			rankText += "  " + eventAvailableMarker;
		}

		const nameWidth = Math.floor(rect.width * 0.5);
		const rankWidth = rect.width - nameWidth;

		this.resetTextColor();
		this.drawText(character.displayName, rect.x, rect.y, nameWidth, "left");
		this.drawText(rankText, rect.x + nameWidth, rect.y, rankWidth, "right");
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
	// By the way, paying for a copy of this is ILLEGAL. DEMAND YOUR MONEY BACK!

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

		// Face goes first if configured; without it the layout shifts up
		// so the stats start at the top edge. The face draw is deferred
		// to the load listener but the stats can render immediately.
		if (character.faceName) {
			const bitmap = ImageManager.loadFace(character.faceName);
			bitmap.addLoadListener(() => this.drawCharacterFace());
		}
		this.drawStats();
	};

	Window_RelationshipProfile.prototype.drawCharacterFace = function() {
		const character = getCharacterConfig(this._key);
		if (!character || !character.faceName) return;
		const bitmap = ImageManager.loadFace(character.faceName);
		const fw = ImageManager.faceWidth;
		const fh = ImageManager.faceHeight;
		const sx = Math.floor((character.faceIndex % 4) * fw);
		const sy = Math.floor(Math.floor(character.faceIndex / 4) * fh);
		const dx = Math.floor((this.contents.width - fw) / 2);
		const dy = 0;
		this.contents.blt(bitmap, sx, sy, fw, fh, dx, dy);
	};

	Window_RelationshipProfile.prototype.drawStats = function() {
		const character = getCharacterConfig(this._key);
		if (!character) return;

		const key = this._key;
		const lineHeight = this.lineHeight();
		const labelWidth = 120;
		const valueX = labelWidth + 16;
		const valueWidth = this.contents.width - valueX;
		// Stats start below the face if one is configured, otherwise from
		// the top of the window — no dead space when there's no face.
		let y = character.faceName ? ImageManager.faceHeight + 12 : 0;

		// Display name (slightly larger).
		const baseFontSize = $gameSystem.mainFontSize();
		this.contents.fontSize = baseFontSize + 8;
		this.drawText(character.displayName, 0, y, this.contents.width, "left");
		y += lineHeight + 12;
		this.contents.fontSize = baseFontSize;

		// Title.
		this.changeTextColor(ColorManager.systemColor());
		this.drawText("Title:", 0, y, labelWidth, "left");
		this.resetTextColor();
		this.drawText($gameSystem.getRelationshipTitleName(key), valueX, y, valueWidth, "left");
		y += lineHeight;

		// Soulmate badge (only shown if applicable).
		if ($gameSystem.isSoulmate(key)) {
			this.changeTextColor(ColorManager.powerUpColor());
			this.drawText("\u2665 Soulmate", 0, y, this.contents.width, "left");
			this.resetTextColor();
			y += lineHeight;
		}

		// Points / cap.
		const points = $gameSystem.getRelationshipPoints(key);
		const cap = $gameSystem.isSoulmate(key) ? soulmateCap : nonSoulmateCap;
		this.changeTextColor(ColorManager.systemColor());
		this.drawText("Points:", 0, y, labelWidth, "left");
		this.resetTextColor();
		this.drawText(`${points} / ${cap}`, valueX, y, valueWidth, "left");
		y += lineHeight;

		// Within-tier progress, or MAX.
		const nextEvent = $gameSystem.getNextEventThreshold(key);
		this.changeTextColor(ColorManager.systemColor());
		this.drawText("Progress:", 0, y, labelWidth, "left");
		this.resetTextColor();
		if (nextEvent === null || nextEvent > cap) {
			this.drawText("MAX", valueX, y, valueWidth, "left");
		} else {
			const lastEvent = nextEvent - pointsPerTier;
			const within = Math.max(0, Math.min(pointsPerTier, points - lastEvent));
			this.drawText(`${within} / ${pointsPerTier}`, valueX, y, valueWidth, "left");
		}
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
	// Free-form text panel on the upper-right. Renders with drawTextEx so
	// text codes (\C[n], \I[n], \., \|, etc.) and embedded newlines work.
	// Author is responsible for line breaks — drawTextEx does not auto-wrap
	// on width, so long single lines will spill off the right edge.
	//
	// Reads from $gameSystem.getRelationshipDescription, which returns the
	// runtime override if one has been set or the configured plugin-param
	// description otherwise. Empty/blank descriptions render an empty
	// window (no placeholder), consistent with the rest of the plugin.
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
		this.drawTextEx(text, 0, 0, this.contents.width);
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
