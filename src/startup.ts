interface SecretCharacter {
  name: string;
  description: string;
}

const BLACKLIST_STORAGE_KEY = "SecretCharacterSpawner.blacklist";

function openSecretCharacterSpawnerWindow(secretCharacters: SecretCharacter[]) {
  ui.closeWindows("secret-character-spawner");

  function getBlacklist(
    secretCharacters: SecretCharacter[],
  ): SecretCharacter[] {
    const blacklistedNames = context.sharedStorage.get<string[]>(
      BLACKLIST_STORAGE_KEY,
      [],
    );

    return secretCharacters.filter(
      (character) => blacklistedNames.indexOf(character.name) !== -1,
    );
  }

  //   const blacklist = [
  //     {
  //       name: "Mr Bean",
  //       description: "Drives very slow",
  //     },
  //   ];
  let blacklist = getBlacklist(secretCharacters);
  //const blacklist = getBlacklist(secretCharacters);
  let whitelist = secretCharacters.filter((c) =>
    blacklist.every((b) => b.name !== c.name),
  );

  ui.openWindow({
    classification: "secret-character-spawner",
    title: "Secret Character Spawner",
    width: 420,
    height: 440,
    widgets: [
      {
        type: "listview",
        x: 10,
        y: 20,
        width: 400,
        height: 150,
        scrollbars: "vertical",
        isStriped: true,
        showColumnHeaders: true,
        canSelect: true,
        columns: [
          { header: "Name", width: 130 },
          { header: "Description", width: 260 },
        ],
        items: whitelist.map((character) => [
          character.name,
          character.description,
        ]),
      },
      {
        type: "button",
        x: 310,
        y: 180,
        width: 100,
        height: 20,
        text: "Spawn",
        onClick: () => {
          console.log("Spawn clicked");
        },
      },
    ],
  });
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

  context.sharedStorage.set(BLACKLIST_STORAGE_KEY, []);
  //   if (!context.sharedStorage.has(BLACKLIST_STORAGE_KEY)) {
  //     context.sharedStorage.set(BLACKLIST_STORAGE_KEY, []);
  //   }

  // Register a menu item under the map icon:
  if (typeof ui !== "undefined") {
    ui.registerMenuItem("Secret Character Spawner", () =>
      openSecretCharacterSpawnerWindow(secretCharacters),
    );
  }
}
