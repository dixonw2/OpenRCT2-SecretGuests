import { SecretCharacter, SECRET_CHARACTERS } from "./characters";
import {
  getBlacklistNames,
  getSpawnChance,
  getSpawnCountPerName,
  getSpawnCountTotal,
} from "./settings";
const SET_CHARACTER_FLAGS_ACTION = "secretcharacterspawner_setflags";

interface SetCharacterFlagsArgs {
  guestId: number;
  flags: PeepFlags[];
}

export function getCurrentSecretCount(name: string): number {
  return map.getAllEntities("guest").filter((guest) => guest.name === name)
    .length;
}

export function getTotalSecretCount(): number {
  return map
    .getAllEntities("guest")
    .filter((guest) =>
      SECRET_CHARACTERS.some((character) => character.name === guest.name),
    ).length;
}

export function getEligibleCharacters(): SecretCharacter[] {
  const blacklistedNames = getBlacklistNames();
  const maxPerName = getSpawnCountPerName();
  const maxTotal = getSpawnCountTotal();

  if (getTotalSecretCount() >= maxTotal) {
    return [];
  }

  return SECRET_CHARACTERS.filter(
    (character) =>
      blacklistedNames.indexOf(character.name) === -1 &&
      getCurrentSecretCount(character.name) < maxPerName,
  );
}

export function getRandomCharacter(
  characters: SecretCharacter[],
): SecretCharacter | null {
  if (characters.length === 0) {
    return null;
  }

  return characters[Math.floor(Math.random() * characters.length)];
}

export function spawnCharacter(
  character: SecretCharacter,
  onSpawn?: (character: SecretCharacter) => void,
): void {
  const guests = map
    .getAllEntities("guest")
    .filter((guest) => !isGuestSecret(guest.name));

  if (guests.length === 0) {
    return;
  }

  const randGuest = guests[Math.floor(Math.random() * guests.length)];

  if (randGuest.id === null) {
    return;
  }

  park.postMessage({
    type: "peep",
    text: `${randGuest.name} was renamed to ${character.name}`,
    subject: randGuest.id,
  });

  const guestId = randGuest.id;
  context.executeAction(
    "guestsetname",
    {
      peep: guestId,
      name: character.name,
    },
    () => {
      applyCharacterFlags(guestId, character);

      if (onSpawn !== undefined) {
        onSpawn(character);
      }
    },
  );
}

// if name is not in SECRET_CHARACTERS, return false
function isGuestSecret(name: string): boolean {
  return !SECRET_CHARACTERS.every((c) => c.name !== name);
}

function applyCharacterFlags(
  guestId: number,
  character: SecretCharacter,
): void {
  if (character.flags === undefined || character.flags.length === 0) {
    return;
  }

  context.executeAction(SET_CHARACTER_FLAGS_ACTION, {
    guestId,
    flags: character.flags,
  });
}

export function registerSecretCharacterActions(): void {
  context.registerAction<SetCharacterFlagsArgs>(
    SET_CHARACTER_FLAGS_ACTION,
    () => ({}),
    (event) => {
      const guest = map.getEntity(event.args.guestId);

      if (guest === null || guest.type !== "guest") {
        return {};
      }

      const peep = guest as Guest;

      for (let i = 0; i < event.args.flags.length; i++) {
        peep.setFlag(event.args.flags[i], true);
      }

      return {};
    },
  );
}

export function startSecretCharacterInterval(
  onSpawned: (character: SecretCharacter) => void,
): void {
  context.subscribe("guest.generation", (e) => {
    const guest = map.getEntity(e.id) as Guest;

    if (
      guest === null ||
      guest === undefined ||
      guest.id === null ||
      Math.random() * 100 >= getSpawnChance()
    ) {
      return;
    }

    const character = getRandomCharacter(getEligibleCharacters());

    if (character === null) {
      return;
    }

    park.postMessage({
      type: "peep",
      text: `${guest.name} was renamed to ${character.name}`,
      subject: guest.id,
    });

    context.executeAction(
      "guestsetname",
      {
        peep: guest.id,
        name: character.name,
      },
      () => {
        applyCharacterFlags(e.id, character);
        onSpawned(character);
      },
    );
  });
}
