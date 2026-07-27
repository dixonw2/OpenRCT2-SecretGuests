interface SecretCharacter {
  name: string;
  description: string;
}

const WINDOW_CLASSIFICATION = "secret-character-spawner-extended";
const BLACKLIST_STORAGE_KEY = "SecretCharacterSpawnerExtended.blacklist";
const SPAWN_CHANCE_STORAGE_KEY = "SecretCharacterSpawnerExtended.spawnChance";
const SPAWN_COUNT_PER_NAME_STORAGE_KEY =
  "SecretCharacterSpawnerExtended.spawnCountPerName";
const SPAWN_COUNT_TOTAL_STORAGE_KEY =
  "SecretCharacterSpawnerExtended.spawnCountTotal";

const SECRET_CHARACTERS: SecretCharacter[] = [
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
    description: "Gifts guests and self purple shirts",
  },
  {
    name: "Joanne Barton",
    description: "Gifts guests and self pizza",
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

const SPAWN_CHANCE_DEFAULT = 0.5;
const SPAWN_COUNT_PER_NAME_DEFAULT = 1;
const SPAWN_COUNT_TOTAL_DEFAULT = SECRET_CHARACTERS.length;

const SPAWN_COUNT_PER_NAME_MAX = 999;
const SPAWN_COUNT_TOTAL_MAX = 999;

const TICKS_PER_CHECK = 40;

let displayedCharacterName: string | null = null;

// change this to default to a default constant? Maybe with blacklist of negative characters?
function getBlacklistNames(): string[] {
  return context.sharedStorage.get<string[]>(BLACKLIST_STORAGE_KEY, []);
}

function getSpawnChance(): number {
  return context.sharedStorage.get<number>(
    SPAWN_CHANCE_STORAGE_KEY,
    SPAWN_CHANCE_DEFAULT,
  );
}

function getSpawnCountPerName(): number {
  return context.sharedStorage.get<number>(
    SPAWN_COUNT_PER_NAME_STORAGE_KEY,
    SPAWN_COUNT_PER_NAME_DEFAULT,
  );
}

function getSpawnCountTotal(): number {
  return context.sharedStorage.get<number>(
    SPAWN_COUNT_TOTAL_STORAGE_KEY,
    SPAWN_COUNT_TOTAL_DEFAULT,
  );
}

function getCurrentSecretCount(name: string): number {
  return map.getAllEntities("guest").filter((guest) => guest.name === name)
    .length;
}

function getTotalSecretCount(): number {
  return map
    .getAllEntities("guest")
    .filter((guest) =>
      SECRET_CHARACTERS.some((character) => character.name === guest.name),
    ).length;
}

function getEligibleCharacters(): SecretCharacter[] {
  const blacklistedNames = getBlacklistNames();
  const maxPerName = getSpawnCountPerName();
  const maxTotal = getSpawnCountTotal();

  if (getTotalSecretCount() >= maxTotal) {
    return [];
  }

  return SECRET_CHARACTERS.filter(
    (c) =>
      blacklistedNames.indexOf(c.name) === -1 &&
      getCurrentSecretCount(c.name) < maxPerName,
  );
}

function getRandomCharacter(characters: SecretCharacter[]): SecretCharacter | null {
  if (characters.length === 0) {
    return null;
  }

  return characters[Math.floor(Math.random() * characters.length)];
}

function setDescription(
  character: SecretCharacter | null,
  labelWidget: LabelWidget,
): void {
  if (character === null) {
    displayedCharacterName = null;
    labelWidget.text = "";
    return;
  }

  displayedCharacterName = character.name;

  const curCharCount = map
    .getAllEntities("guest")
    .filter((c) => c.name === character.name).length;

  labelWidget.text = `${character.name}: ${character.description} (Current: ${curCharCount})`;
}

function updateOpenWindowDescriptionIfDisplayed(
  character: SecretCharacter,
): void {
  if (displayedCharacterName !== character.name) {
    return;
  }

  if (typeof ui === "undefined") {
    return;
  }

  const openWindow = ui.getWindow(WINDOW_CLASSIFICATION);

  if (openWindow === null || openWindow === undefined) {
    return;
  }

  const descriptionLabel = openWindow.findWidget<LabelWidget>(
    "character-description-label",
  );

  setDescription(character, descriptionLabel);
}

function startSecretCharacterInterval(): void {
  const checkedGuestIds: number[] = [];
  let initialScan = true;
  let tickCounter = 0;

  context.subscribe("interval.tick", () => {
    tickCounter++;
    if (tickCounter < TICKS_PER_CHECK) {
      return;
    }
    tickCounter = 0;

    const guests = map.getAllEntities("guest");

    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];

      if (guest.id === null || checkedGuestIds.indexOf(guest.id) !== -1) {
        continue;
      }

      checkedGuestIds.push(guest.id);

      // first pass, puts all existing guests into the checked list
      if (initialScan || Math.random() * 100 >= getSpawnChance()) {
        continue;
      }

      const character = getRandomCharacter(getEligibleCharacters());

      if (character === null) {
        continue;
      }

      park.postMessage(`${guest.name} set to ${character.name}`);

      context.executeAction(
        "guestsetname",
        {
          peep: guest.id,
          name: character.name,
        },
        () => {
          updateOpenWindowDescriptionIfDisplayed(character);
        },
      );
    }

    initialScan = false;
  });
}

function openSecretCharactersWindow() {
  let spawnChance = getSpawnChance();
  let spawnCountPerName = getSpawnCountPerName();
  let spawnCountTotal = getSpawnCountTotal();
  let selectedWhitelistIndex = -1;
  let selectedBlacklistIndex = -1;

  let blacklist = getBlacklist();
  let whitelist = getWhitelist(blacklist);

  function getBlacklist(): SecretCharacter[] {
    return SECRET_CHARACTERS.filter(
      (character) => getBlacklistNames().indexOf(character.name) !== -1,
    );
  }

  function saveBlacklist(blacklist: SecretCharacter[]): void {
    context.sharedStorage.set(
      BLACKLIST_STORAGE_KEY,
      blacklist.map((character) => character.name),
    );
  }

  function getWhitelist(blacklist: SecretCharacter[]): SecretCharacter[] {
    return SECRET_CHARACTERS.filter((character) =>
      blacklist.every(
        (blacklistedCharacter) => blacklistedCharacter.name !== character.name,
      ),
    );
  }

  function saveSpawnChance(): void {
    context.sharedStorage.set(SPAWN_CHANCE_STORAGE_KEY, spawnChance);
  }

  function saveSpawnCountPerName(): void {
    context.sharedStorage.set(
      SPAWN_COUNT_PER_NAME_STORAGE_KEY,
      spawnCountPerName,
    );
  }

  function saveSpawnCountTotal(): void {
    context.sharedStorage.set(SPAWN_COUNT_TOTAL_STORAGE_KEY, spawnCountTotal);
  }

  function toListItems(characters: SecretCharacter[]): string[] {
    return characters.map((character) => character.name);
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

  // change to do Set logic etc so that it doesn't overwrite other guest names?
  function spawnCharacter(character: SecretCharacter): void {
    // get guests that aren't named already
    const guests = map
      .getAllEntities("guest")
      .filter((c) => c.name !== character.name);

    if (guests.length === 0) {
      return;
    }

    const randGuest = guests[Math.floor(Math.random() * guests.length)];
    context.executeAction(
      "guestsetname",
      {
        peep: randGuest.id,
        name: character.name,
      },
      // turn into a passed in function so that I can check if it's null so that I can use this function in interval checks to spawn?
      () => {
        // update spawn count for selected character
        setDescription(
          character,
          getLabelWidget("character-description-label"),
        );
      },
    );
  }

  function formatChanceNumber(n: number): number {
    return Number(n.toFixed(1));
  }

  function updateSpawnChanceSpinner(): void {
    const spinner = window.findWidget<SpinnerWidget>("spawn-chance-spinner");
    spinner.text = `${spawnChance}%`;
  }

  function updateSpawnCountPerNameSpinner(): void {
    const spinner = window.findWidget<SpinnerWidget>(
      "spawn-count-name-spinner",
    );
    spinner.text = spawnCountPerName.toString();
  }

  function updateSpawnCountTotalSpinner(): void {
    const spinner = window.findWidget<SpinnerWidget>(
      "spawn-count-total-spinner",
    );
    spinner.text = spawnCountTotal.toString();
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
        setDescription(
          whitelist[selectedWhitelistIndex],
          getLabelWidget("character-description-label"),
        );
      } else {
        // reset description if no item is selected
        setDescription(null, getLabelWidget("character-description-label"));
      }
    } else {
      selectedBlacklistIndex = nextSelectIndex(previousIndex, blacklist.length);

      if (selectedBlacklistIndex !== -1) {
        blacklistWidget.selectedCell = {
          row: selectedBlacklistIndex,
          column: 0,
        };
        setDescription(
          blacklist[selectedBlacklistIndex],
          getLabelWidget("character-description-label"),
        );
      } else {
        // reset description if no item is selected
        setDescription(null, getLabelWidget("character-description-label"));
      }
    }
  }

  function getListWidget(
    widgetName: "whitelist" | "blacklist",
  ): ListViewWidget {
    return window.findWidget<ListViewWidget>(widgetName);
  }

  function getLabelWidget(widgetName: "character-description-label") {
    return window.findWidget<LabelWidget>(widgetName);
  }

  function getWidgets(): WidgetDesc[] {
    return [
      // whitelist
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
          setDescription(
            whitelist[index],
            getLabelWidget("character-description-label"),
          );

          // clear blacklist selected to make selected name clearer
          const blacklistWidget = getListWidget("blacklist");
          blacklistWidget.selectedCell = null;
          toggleForceSpawnButtonEnabled();
        },
      },
      // labels blacklist above list
      {
        type: "label",
        x: 220,
        y: 18,
        width: 190,
        height: 12,
        text: "Blacklisted",
      },
      // blacklist
      {
        type: "listview",
        name: "blacklist",
        x: 220,
        y: 35,
        width: 190,
        height: 175,
        scrollbars: "vertical",
        isStriped: true,
        showColumnHeaders: false,
        canSelect: true,
        columns: [{ header: "Name", width: 180 }],
        items: toListItems(blacklist),
        onClick: (index) => {
          selectedBlacklistIndex = index;
          selectedWhitelistIndex = -1;
          setDescription(
            blacklist[index],
            getLabelWidget("character-description-label"),
          );

          // clear whitelist selected to make selected name clearer
          const whitelistWidget = getListWidget("whitelist");
          whitelistWidget.selectedCell = null;
          toggleForceSpawnButtonEnabled();
        },
      },
      // selected character description
      {
        type: "label",
        name: "character-description-label",
        x: 10,
        y: 215,
        width: 400,
        height: 12,
        text: "",
      },
      // move to blacklist button
      {
        type: "button",
        name: "blacklist-button",
        x: 50,
        y: 232,
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
      // move to whitelist button
      {
        type: "button",
        name: "whitelist-button",
        x: 260,
        y: 232,
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
      // spawn chance label
      {
        type: "label",
        name: "spawn-chance-label",
        x: 10,
        y: 260,
        width: 100,
        height: 12,
        text: "Chance:",
      },
      // spawn chance box
      {
        type: "spinner",
        name: "spawn-chance-spinner",
        x: 110,
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
      // spawn count per name label
      {
        type: "label",
        name: "spawn-count-name-label",
        x: 10,
        y: 275,
        width: 100,
        height: 12,
        text: "Max spawn/name:",
      },
      // spawn count per name box
      {
        type: "spinner",
        name: "spawn-count-name-spinner",
        x: 110,
        y: 275,
        width: 68,
        height: 12,
        text: spawnCountPerName.toString(),
        onDecrement: () => {
          spawnCountPerName = Math.max(0, spawnCountPerName - 1);
          saveSpawnCountPerName();
          updateSpawnCountPerNameSpinner();
        },
        onIncrement: () => {
          spawnCountPerName = Math.min(
            SPAWN_COUNT_PER_NAME_MAX,
            spawnCountPerName + 1,
          );
          saveSpawnCountPerName();
          updateSpawnCountPerNameSpinner();
        },
        onClick: () => {
          ui.showTextInput({
            title: "Set Spawn Count",
            description: "Set max spawn count per name:",
            initialValue: spawnCountPerName.toString(),
            maxLength: 3,
            callback: (input) => {
              const newSpawnCount = Number(input);

              if (isNaN(newSpawnCount)) {
                return;
              }

              spawnCountPerName = Math.max(
                0,
                Math.min(SPAWN_COUNT_PER_NAME_MAX, Math.floor(newSpawnCount)),
              );
              saveSpawnCountPerName();
              updateSpawnCountPerNameSpinner();
            },
          });
        },
      },
      // spawn count total label
      {
        type: "label",
        name: "spawn-count-total-label",
        x: 10,
        y: 290,
        width: 100,
        height: 12,
        text: "Max total spawn:",
      },
      // spawn count total box
      {
        type: "spinner",
        name: "spawn-count-total-spinner",
        x: 110,
        y: 290,
        width: 68,
        height: 12,
        text: spawnCountTotal.toString(),
        onDecrement: () => {
          spawnCountTotal = Math.max(0, spawnCountTotal - 1);
          saveSpawnCountTotal();
          updateSpawnCountTotalSpinner();
        },
        onIncrement: () => {
          spawnCountTotal = Math.min(
            SPAWN_COUNT_TOTAL_MAX,
            spawnCountTotal + 1,
          );
          saveSpawnCountTotal();
          updateSpawnCountTotalSpinner();
        },
        onClick: () => {
          ui.showTextInput({
            title: "Set Spawn Count",
            description: "Set total max spawn count:",
            initialValue: spawnCountTotal.toString(),
            maxLength: 3,
            callback: (input) => {
              const newSpawnCount = Number(input);

              if (isNaN(newSpawnCount)) {
                return;
              }

              spawnCountTotal = Math.max(
                0,
                Math.min(SPAWN_COUNT_TOTAL_MAX, Math.floor(newSpawnCount)),
              );
              saveSpawnCountTotal();
              updateSpawnCountTotalSpinner();
            },
          });
        },
      },
      // force spawn button
      {
        type: "button",
        name: "force-spawn-button",
        x: 260,
        y: 271,
        width: 110,
        height: 20,
        text: "Force Spawn",
        // nothing selected initially; disable
        isDisabled: true,
        onClick: () => {
          const selectedCharacter = getSelectedCharacter();
          if (selectedCharacter !== null) {
            spawnCharacter(selectedCharacter);
          }
        },
      },
    ];
  }

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
    widgets: getWidgets(),
  });
}

export function startup() {
  startSecretCharacterInterval();

  if (typeof ui !== "undefined") {
    ui.registerMenuItem("Secret Character Spawner - Extended", () =>
      openSecretCharactersWindow(),
    );
  }
}
