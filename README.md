# Secret Guests

A configurable plugin for OpenRCT2 to spawn guests with easter egg names.

Inspired by Sun-gd00's [SecretCharacterSpawner](https://github.com/Sun-gd00/OpenRCT2-SecretCharacterSpawner), Built from Basssiiie’s [OpenRCT2 TypeScript plugin template](https://github.com/Basssiiie/OpenRCT2-Simple-Typescript-Template).

<img width="1085" height="617" alt="secretguests" src="https://github.com/user-attachments/assets/f8e125d0-6130-4f38-954c-595ad2bab9d6" />

## Features

- A whitelist/blacklist to prevent specific guests from spawning (for annoying ones, such as Eilidh Bell)
- Each new guest has a configurable chance (default: 0.5%) to spawn with a whitelisted secret name
- Can change the number of secret guests that spawn per name (default: 1)
- Can change the total number of secret guests that spawn (default: 24 + number of custom guests)
- Can force spawn any secret guest

## Planned features

- Allow changing number of secret guests per name individually rather than overall
- Add ability to add custom names to spawn with specific actions

## Installation

1. Download SecretGuests.js from the [Releases](https://github.com/dixonw2/SecretGuests/releases#release-v1.1.0) page.
2. To install it, put the downloaded \*.js file into your /OpenRCT2/plugin folder.
   - Easiest way to find the OpenRCT2-folder is by launching the OpenRCT2 game, click and hold on the red toolbox in the main menu, and select "Open custom content folder".
   - Otherwise this folder is commonly found in C:/Users/<YOUR NAME>/Documents/OpenRCT2/plugin on Windows.
   - If you already had this plugin installed before, you can safely overwrite the old file.
3. Once the file is there, it should show up ingame in the dropdown menu under the map icon.

#TODODODODODOODODODODODODO

Seems like some weird issue between deleting a custom guest and the whitelist/blacklist? Seems like right now the guest is added to whichever list is selected, and maybe there's an issue if there isn't one selected?
I swear I had two custom guests in the blacklist, I deleted one, and the other one switched to the whitelist. Possibly because one was created without selecting a list?
There were some issues with selecting a custom guest and getting a different description for some reason, it seemed. Not sure how to replicate

#FOR BACKWARDS COMPATIBILITY

If anything in sharedStorage's key got changed, make sure to add some kind of data transfer

OH ALSO MAKE BLACKLIST/ALLOW BUTTONS DISABLE ONCE THE WHITELIST OR BLACKLIST IS EMPTY
