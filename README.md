# Secret Guests

A configurable plugin for OpenRCT2 to spawn guests with easter egg names.

Inspired by Sun-gd00's [SecretCharacterSpawner](https://github.com/Sun-gd00/OpenRCT2-SecretCharacterSpawner), Built from Basssiiie’s [OpenRCT2 TypeScript plugin template](https://github.com/Basssiiie/OpenRCT2-Simple-Typescript-Template).

<img width="1426" height="823" alt="secretguests_v1_2_0" src="https://github.com/user-attachments/assets/f561d994-3dc8-4ea3-abce-6b27f29b7f5c" />

<!-- v1.0.0 image -->
<!--<img width="1085" height="617" alt="secretguests" src="https://github.com/user-attachments/assets/f8e125d0-6130-4f38-954c-595ad2bab9d6" />-->

## Features

- A whitelist/blacklist to prevent specific guests from spawning (for annoying ones, such as Eilidh Bell)
- Each new guest has a configurable chance (default: 0.5%) to spawn with a whitelisted secret name
- Can change the number of secret guests that spawn per name (default: 1)
- Can change the total number of secret guests that spawn (default: 24 + number of custom guests)
- Can force spawn any secret guest regardless of spawn conditions (as long as there is a guest that exists without that name)
- Secret guests can be configured to have individual spawn weights/spawn caps
  - When a guest is chosen to be renamed, it will then factor in spawn weights so that a higher weight has a higher chance to spawn
  - Individual spawn cap will bypass the overall "Max spawn/name" value

## Planned features

- Add ability to add custom names to spawn with specific actions

## Installation

1. Download SecretGuests.js from the [Releases](https://github.com/dixonw2/SecretGuests/releases#release-v1.2.0) page.
2. To install it, put the downloaded \*.js file into your /OpenRCT2/plugin folder.
   - Easiest way to find the OpenRCT2-folder is by launching the OpenRCT2 game, click and hold on the red toolbox in the main menu, and select "Open custom content folder".
   - Otherwise this folder is commonly found in C:/Users/YOUR NAME/Documents/OpenRCT2/plugin on Windows.
   - If you already had this plugin installed before, you can safely overwrite the old file.
3. Once the file is there, it should show up ingame in the dropdown menu under the map icon.

## Version History

### v.1.2.0

- Spawn chance can now be less than 0.1 (0.01 to 0.09) for even more rare guest spawns
- Guests can be configured to have individual spawn caps/spawn weights
- Add ability to deselect a guest
  - Not really useful but in case someone wanted it

### v.1.1.0

- Can turn notifications on/off for when a secret guest spawns

### v1.0.0

- Whitelist/blacklist for naturally spawning secret guests
  - Can force spawn a guest regardless of whitelist/blacklist
- Configurable chance for naturally spawning secret guests
- Configurable number of guests that may spawn per name
- Can change total amount of secret guests to spawn
