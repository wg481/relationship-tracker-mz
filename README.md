# Relationship Tracker for RPG Maker MZ.
A relationship management plugin for RPG Maker MZ.

View the [tutorial](RelationshipTracker_Tutorial.md) for usage.

## Features
* Six-tier title progression (Strangers → Soulmate) driven by event playback, not raw points
* Eight event thresholds per character (0/100/200/300/400/500/600/700)
* Per-event spawn points: X coordinate, Y coordinate, and facing direction configurable per threshold
* Dedicated event maps with automatic save-position-and-return on event play
* Soulmate system with 500-point choice gate, exclusivity enforcement, and optional multi-soulmate mode for polyamory routes
* Soulmate styling with configurable name color and ♥ suffix in both list and detail views
* Per-character relationship menu, inserted directly below Status in the main menu
* Character detail page with portrait, stats panel, free-form description, and command list
* Portrait fallback to Actor1[0] for characters without a configured face
* In-detail character cycling via PgUp/PgDn or cursor Left/Right, with wrap-around
* Progress gauge with configurable fill color, within-tier label, and drop shadow
* Rank pips showing one filled/empty circle per reachable event threshold, with adaptive font sizing
* Empty-state message when no characters have been met yet (configurable text)
* Free-form character descriptions with MZ text-code support (\C[n], \I[n], \V[n], \N[n], font-size, pauses) and word-wrap on width
* Runtime description overrides via plugin command, saved with the game
* Threshold-crossed toast notifications: one-shot per character per threshold, with configurable position (four corners), face thumbnail toggle, margins, width, dwell time, SE, and message text
* Tier-up notifications: SE + message fired after event content plays
* Optional menu visibility toggle gated on a game switch
* Show-switch and configurable plugin-command labels for full UI customization
* Public script-call API on $gameSystem for points, titles, met/soulmate flags, descriptions, and event state for use in Conditional Branches and Control Variables
* Seven plugin commands (Add Points, Set Points, Meet Character, Play Character Event, Return From Event, Set Soulmate, Set Description) for full event-author control
* Save-compatible state model on $gameSystem.

## Feature Requests
[] MV Backport
All other feature requests, add to issues.

### AI DISCLOSURE
Claude models assisted in creating this program. I understand the environmental impacts of using AI and do actively work to offset those impacts through volunteer service and running local models.
