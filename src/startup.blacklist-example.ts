interface SecretCharacter {
  name: string;
  description: string;
}

const WINDOW_CLASSIFICATION = "secret-character-spawner-extended";
const BLACKLIST_STORAGE_KEY = "SecretCharacterSpawnerExtended.blacklist";
const SPAWN_CHANCE_STORAGE_KEY = "SecretCharacterSpawnerExtended.spawnChance";

function openSecretCharacterSpawnerWindow(secretCharacters: SecretCharacter[]) {
  function getBlacklist(): SecretCharacter[] {
    const blacklistedNames = context.sharedStorage.get<string[]>(
      BLACKLIST_STORAGE_KEY,
      [],
    );

    return secretCharacters.filter(
      (character) => blacklistedNames.indexOf(character.name) !== -1,
    );
  }

  function saveBlacklist(blacklist: SecretCharacter[]): void {
    context.sharedStorage.set(
      BLACKLIST_STORAGE_KEY,
      blacklist.map((character) => character.name),
    );
  }

  function getWhitelist(blacklist: SecretCharacter[]): SecretCharacter[] {
    return secretCharacters.filter((character) =>
      blacklist.every(
        (blacklistedCharacter) => blacklistedCharacter.name !== character.name,
      ),
    );
  }

  let spawnChance = getSpawnChance();

  function getSpawnChance(): number {
    return context.sharedStorage.get<number>(SPAWN_CHANCE_STORAGE_KEY, 0.5);
  }

  function saveSpawnChance(): void {
    context.sharedStorage.set(SPAWN_CHANCE_STORAGE_KEY, spawnChance);
  }

  function toListItems(characters: SecretCharacter[]): string[][] {
    return characters.map((character) => [character.name]);
  }

  function nextSelectIndex(index: number, listLength: number): number {
    if (listLength === 0) {
      return -1;
    }

    if (index >= listLength) {
      return listLength - 1;
    }

    return index;
  }

  let blacklist = getBlacklist();
  let whitelist = getWhitelist(blacklist);

  let selectedWhitelistIndex = -1;
  let selectedBlacklistIndex = -1;

  const windowOpen = ui.getWindow(WINDOW_CLASSIFICATION);
  if (windowOpen !== null && windowOpen !== undefined) {
    windowOpen.bringToFront();
    return;
  }

  const window = ui.openWindow({
    classification: WINDOW_CLASSIFICATION,
    title: "Secret Character Spawner - Extended",
    width: 420,
    height: 320,
    widgets: [
      // labels blacklist above list
      {
        type: "label",
        x: 220,
        y: 18,
        width: 190,
        height: 12,
        text: "Blacklisted",
      },
      {
        type: "listview",
        name: "whitelist",
        x: 10,
        y: 35,
        width: 190,
        height: 175,
        scrollbars: "vertical",
        isStriped: true,
        showColumnHeaders: false,
        canSelect: true,
        columns: [{ header: "Name", width: 180 }],
        items: toListItems(whitelist),
        onClick: (index) => {
          selectedWhitelistIndex = index;
          selectedBlacklistIndex = -1;
          setDescription(whitelist[index]);

          // clear blacklist selected to make selected name clearer
          const blacklistWidget = getListWidget("blacklist");
          blacklistWidget.selectedCell = null;
          toggleForceSpawnButtonEnabled();
        },
      },
      {
        type: "listview",
        name: "blacklist",
        x: 220,
        y: 35,
        width: 190,
        height: 175,
        scrollbars: "vertical",
        isStriped: true,
        //CHANGE TO FALSE
        showColumnHeaders: false,
        canSelect: true,
        columns: [{ header: "Name", width: 180 }],
        items: toListItems(blacklist),
        onClick: (index) => {
          selectedBlacklistIndex = index;
          selectedWhitelistIndex = -1;
          setDescription(blacklist[index]);

          // clear whitelist selected to make selected name clearer
          const whitelistWidget = getListWidget("whitelist");
          whitelistWidget.selectedCell = null;
          toggleForceSpawnButtonEnabled();
        },
      },
      {
        type: "button",
        name: "blacklist-button",
        x: 50,
        y: 220,
        width: 110,
        height: 20,
        text: "Blacklist >",
        onClick: () => {
          if (
            selectedWhitelistIndex < 0 ||
            selectedWhitelistIndex >= whitelist.length
          ) {
            return;
          }

          const character = whitelist[selectedWhitelistIndex];
          const nextWhitelistIndex = selectedWhitelistIndex;

          saveBlacklist(blacklist.concat([character]));
          refreshLists("whitelist", nextWhitelistIndex);
          toggleForceSpawnButtonEnabled();
        },
      },
      {
        type: "button",
        name: "whitelist-button",
        x: 260,
        y: 220,
        width: 110,
        height: 20,
        text: "< Allow",
        onClick: () => {
          if (
            selectedBlacklistIndex < 0 ||
            selectedBlacklistIndex >= blacklist.length
          ) {
            return;
          }

          const character = blacklist[selectedBlacklistIndex];
          const nextBlacklistIndex = selectedBlacklistIndex;
          const newBlacklist = blacklist.filter(
            (blacklistedCharacter) =>
              blacklistedCharacter.name !== character.name,
          );

          saveBlacklist(newBlacklist);
          refreshLists("blacklist", nextBlacklistIndex);
          toggleForceSpawnButtonEnabled();
        },
      },
      {
        type: "label",
        name: "character-description-label",
        x: 10,
        y: 245,
        width: 400,
        height: 12,
        // empty initially
        text: "",
      },
      {
        type: "label",
        name: "spawn-chance-label",
        x: 10,
        y: 260,
        width: 80,
        height: 12,
        // empty initially
        text: "Spawn chance: ",
      },
      {
        type: "spinner",
        name: "spawn-chance-spinner",
        x: 95,
        y: 260,
        width: 68,
        height: 12,
        text: `${spawnChance}%`,
        onDecrement: () => {
          spawnChance = Math.max(0, formatChanceNumber(spawnChance - 0.1));
          saveSpawnChance();
          updateSpawnChanceSpinner();
        },
        onIncrement: () => {
          spawnChance = Math.min(100, formatChanceNumber(spawnChance + 0.1));
          saveSpawnChance();
          updateSpawnChanceSpinner();
        },
        onClick: () => {
          ui.showTextInput({
            title: "Set Spawn Chance",
            description: "New spawn chance:",
            initialValue: spawnChance.toString(),
            maxLength: 4,
            callback: (input) => {
              const newSpawnChance = Number(input);

              if (isNaN(newSpawnChance)) {
                return;
              }

              spawnChance = Math.max(
                0,
                Math.min(100, formatChanceNumber(newSpawnChance)),
              );
              saveSpawnChance();
              updateSpawnChanceSpinner();
            },
          });
        },
      },
      {
        type: "button",
        name: "force-spawn-button",
        x: 155,
        y: 280,
        width: 110,
        height: 20,
        text: "Force Spawn",
        // nothing selected initially; disable
        isDisabled: true,
        onClick: () => spawnSelectedCharacter(),
      },
    ],
  });

  function spawnCharacter(character: SecretCharacter): void {
    const guests = map.getAllEntities("guest");
    
  }

  function spawnSelectedCharacter(): void {
    const guests = map.getAllEntities("guest");
    let randGuest = guests[Math.floor(Math.random() * guests.length)];
    const selectedCharacter = getSelectedCharacter();

    if (selectedCharacter === null || selectedCharacter === undefined) {
      return;
    }

    context.executeAction("guestsetname", {
      peep: randGuest.id,
      name: selectedCharacter.name,
    });
  }

  function formatChanceNumber(n: number): number {
    return Number(n.toFixed(1));
  }

  function updateSpawnChanceSpinner(): void {
    const spinner = window.findWidget<SpinnerWidget>("spawn-chance-spinner");
    spinner.text = `${spawnChance}%`;
  }

  function toggleForceSpawnButtonEnabled(): void {
    const button = window.findWidget<ButtonWidget>("force-spawn-button");
    button.isDisabled =
      selectedWhitelistIndex === -1 && selectedBlacklistIndex === -1;
  }

  function getSelectedCharacter(): SecretCharacter | null {
    if (selectedWhitelistIndex >= 0) {
      return whitelist[selectedWhitelistIndex] ?? null;
    }

    if (selectedBlacklistIndex >= 0) {
      return blacklist[selectedBlacklistIndex] ?? null;
    }

    return null;
  }

  function setDescription(character: SecretCharacter | null): void {
    const descriptionLabel = window.findWidget<LabelWidget>(
      "character-description-label",
    );

    if (character === null) {
      descriptionLabel.text = "";
      return;
    }

    descriptionLabel.text = `${character.name}: ${character.description}`;
  }

  function refreshLists(
    listToReselect: "whitelist" | "blacklist",
    previousIndex: number,
  ): void {
    blacklist = getBlacklist();
    whitelist = getWhitelist(blacklist);

    const whitelistWidget = getListWidget("whitelist");
    const blacklistWidget = getListWidget("blacklist");

    whitelistWidget.items = toListItems(whitelist);
    blacklistWidget.items = toListItems(blacklist);
    whitelistWidget.selectedCell = null;
    blacklistWidget.selectedCell = null;

    selectedWhitelistIndex = -1;
    selectedBlacklistIndex = -1;

    if (listToReselect === "whitelist") {
      selectedWhitelistIndex = nextSelectIndex(previousIndex, whitelist.length);

      if (selectedWhitelistIndex !== -1) {
        whitelistWidget.selectedCell = {
          row: selectedWhitelistIndex,
          column: 0,
        };
        setDescription(whitelist[selectedWhitelistIndex]);
      } else {
        // reset description if no item is selected
        setDescription(null);
      }
    } else {
      selectedBlacklistIndex = nextSelectIndex(previousIndex, blacklist.length);

      if (selectedBlacklistIndex !== -1) {
        blacklistWidget.selectedCell = {
          row: selectedBlacklistIndex,
          column: 0,
        };
        setDescription(blacklist[selectedBlacklistIndex]);
      } else {
        // reset description if no item is selected
        setDescription(null);
      }
    }
  }

  function getListWidget(
    widgetName: "whitelist" | "blacklist",
  ): ListViewWidget {
    return window.findWidget<ListViewWidget>(widgetName);
  }
}

export function startup() {
  const secretCharacters: SecretCharacter[] = [
    {
      name: "Mr Bean",
      description: "Drives very slow",
    },
    {
      name: "Chris Sawyer",
      description: "Drives faster than normal; Photographer",
    },
    {
      name: "Jacques Villeneuve",
      description: "Drives much faster than normal",
    },
    {
      name: "Michael Schumacher",
      description: "Drives insanely fast",
    },
    {
      name: "Damon Hill",
      description: "Drives at warp speed",
    },
    {
      name: "Simon Foster",
      description: "Painter",
    },
    {
      name: "Katie Smith",
      description: "Frequently jumps",
    },
    {
      name: "Katie Brayshaw",
      description: "Frequently waves",
    },
    {
      name: "Katie Rodger",
      description: "Leaves the park",
    },
    {
      name: "Lisa Stirling",
      description: "Frequently litters",
    },
    {
      name: "Eilidh Bell",
      description: "Frequently vandalizes",
    },
    {
      name: "Felicity Anderson",
      description: "Causes other guests to vomit (she stinky)",
    },
    {
      name: "Frances McGowan",
      description: "Frequently needs to use the bathroom",
    },
    {
      name: "Katherine McGowan",
      description: "Frequently needs to eat",
    },
    {
      name: "Carol Young",
      description: "Happiness frequently decreases",
    },
    {
      name: "Mia Sheridan",
      description: "Nausea frequently increases",
    },
    {
      name: "Melanie Warn",
      description: "Happiness/Energy maximized; Nausea minimized",
    },
    {
      name: "Emma Garrell",
      description: "Gifts guests/self purple shirts",
    },
    {
      name: "Joanne Barton",
      description: "Gifts guests/self pizza",
    },
    {
      name: "Nancy Stillwagon",
      description: "Gifts guests ice cream",
    },
    {
      // \u201C explicitly uses a left double quotation mark, \u201D uses a right
      // Using " instead uses solely a right
      name: "Corina Massoura",
      description: "Thinks \u201CIt's too crowded here\u201D",
    },
    {
      name: "Donald MacRae",
      description: "Thinks \u201CI'm lost!\u201D",
    },
    {
      name: "John Wardley",
      description: "Thinks \u201CWow!\u201D (on ride)",
    },
    {
      name: "David Ellis",
      description: "Thinks \u201C...and here we are on <ride>!\u201D (on ride)",
    },
  ];

  if (!context.sharedStorage.has(BLACKLIST_STORAGE_KEY)) {
    context.sharedStorage.set<string[]>(BLACKLIST_STORAGE_KEY, []);
  }

  if (typeof ui !== "undefined") {
    ui.registerMenuItem("Secret Character Spawner - Extended", () =>
      openSecretCharacterSpawnerWindow(secretCharacters),
    );
  }
}
