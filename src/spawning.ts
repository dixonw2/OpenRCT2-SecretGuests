import { SecretCharacter, SECRET_CHARACTERS } from "./characters";
import {
  getBlacklistNames,
  getSpawnChance,
  getSpawnCountPerName,
  getSpawnCountTotal,
} from "./settings";

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
  //   const guests = map
  //     .getAllEntities("guest")
  //     .filter((guest) => guest.name !== character.name);

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
    () => {
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

export function startSecretCharacterInterval(
  onSpawned: (character: SecretCharacter) => void,
): void {
  context.subscribe("guest.generation", (e) => {
    const guest = map.getEntity(e.id) as Guest;

    if (
      guest === null ||
      guest === undefined ||
      Math.random() * 100 >= getSpawnChance()
    ) {
      return;
    }

    const character = getRandomCharacter(getEligibleCharacters());

    if (character === null) {
      return;
    }

    park.postMessage(`${guest.name} set to ${character.name}`);

    context.executeAction(
      "guestsetname",
      {
        peep: guest.id,
        name: character.name,
      },
      () => {
        onSpawned(character);
      },
    );
  });
}
