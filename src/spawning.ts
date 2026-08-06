import { SecretGuest } from "./guests";
import { getAllGuests } from "./guestLists";
import {
  getBlacklistNames,
  getSpawnChance,
  getSpawnCountPerName,
  getSpawnCountTotal,
  getNotifyOnSpawn,
} from "./storage";
const SET_GUEST_FLAGS_ACTION = "secretguests_setflags";

interface SetGuestFlagsArgs {
  guestId: number;
  flags: PeepFlags[];
  enabled: boolean;
}

export function getCurrentSecretCount(name: string): number {
  return map.getAllEntities("guest").filter((guest) => guest.name === name)
    .length;
}

function getEligibleGuests(): SecretGuest[] {
  const allSecretGuests = getAllGuests();
  const blacklistedNames = getBlacklistNames();
  const secretNames = allSecretGuests.map((guest) => guest.name);

  const countsByName: { [name: string]: number } = {};
  let totalSecretCount = 0;

  for (const guest of map.getAllEntities("guest")) {
    countsByName[guest.name] = (countsByName[guest.name] ?? 0) + 1;

    if (secretNames.indexOf(guest.name) !== -1) {
      totalSecretCount++;
    }
  }

  if (totalSecretCount >= getSpawnCountTotal()) {
    return [];
  }

  return allSecretGuests.filter(
    (guest) =>
      blacklistedNames.indexOf(guest.name) === -1 &&
      (countsByName[guest.name] ?? 0) < getEffectiveSpawnCount(guest),
  );
}

function getEffectiveSpawnCount(guest: SecretGuest): number {
  return guest.enableCustomSpawnSettings === true &&
    guest.customSpawnCount !== undefined
    ? guest.customSpawnCount
    : getSpawnCountPerName();
}

function getEffectiveSpawnWeight(guest: SecretGuest): number {
  return guest.enableCustomSpawnSettings === true &&
    guest.customSpawnWeight !== undefined
    ? guest.customSpawnWeight
    : 1;
}

function getRandomWeightedGuest(guests: SecretGuest[]): SecretGuest | null {
  let totalWeight = 0;
  for (const guest of guests) {
    totalWeight += Math.max(0, getEffectiveSpawnWeight(guest));
  }

  if (totalWeight <= 0) {
    return null;
  }

  let roll = Math.random() * totalWeight;

  for (const guest of guests) {
    roll -= Math.max(0, getEffectiveSpawnWeight(guest));

    if (roll < 0) {
      return guest;
    }
  }

  return null;
}

// CAN overwrite existing spawned guests with different names
export function forceSpawnGuest(
  guest: SecretGuest,
  onSpawn?: (guest: SecretGuest) => void,
): void {
  const guests = map
    .getAllEntities("guest")
    .filter((g) => g.name !== guest.name);

  if (guests.length === 0) {
    return;
  }

  const randGuest = guests[Math.floor(Math.random() * guests.length)];
  if (randGuest.id === null) {
    return;
  }

  if (getNotifyOnSpawn()) {
    park.postMessage({
      type: "peep",
      text: `${randGuest.name} was renamed to ${guest.name}`,
      subject: randGuest.id,
    });
  }

  const guestId = randGuest.id;
  context.executeAction(
    "guestsetname",
    {
      peep: guestId,
      name: guest.name,
    },
    () => {
      applyGuestFlags(guestId, guest);

      if (onSpawn !== undefined) {
        onSpawn(guest);
      }
    },
  );
}

function applyGuestFlags(guestId: number, guest: SecretGuest): void {
  if (guest.flags === undefined || guest.flags.length === 0) {
    return;
  }

  context.executeAction(SET_GUEST_FLAGS_ACTION, {
    guestId,
    flags: guest.flags,
    enabled: true,
  });
}

export function applyGuestFlagToExistingGuests(
  guestName: string,
  flag: PeepFlags,
  enabled: boolean,
): void {
  const guests = map
    .getAllEntities("guest")
    .filter((guest) => guest.name === guestName && guest.id !== null);

  for (const guest of guests) {
    context.executeAction(SET_GUEST_FLAGS_ACTION, {
      guestId: guest.id as number,
      flags: [flag],
      enabled,
    });
  }
}

export function registerSecretGuestActions(): void {
  context.registerAction<SetGuestFlagsArgs>(
    SET_GUEST_FLAGS_ACTION,
    () => ({}),
    (event) => {
      const guest = map.getEntity(event.args.guestId);

      if (guest === null || guest.type !== "guest") {
        return {};
      }

      const peep = guest as Guest;

      for (const flag of event.args.flags) {
        peep.setFlag(flag, event.args.enabled);
      }

      return {};
    },
  );
}

export function startSecretGuestInterval(
  onSpawned: (guest: SecretGuest) => void,
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

    const randGuest = getRandomWeightedGuest(getEligibleGuests());

    if (randGuest === null) {
      return;
    }

    if (getNotifyOnSpawn()) {
      park.postMessage({
        type: "peep",
        text: `${guest.name} was renamed to ${randGuest.name}`,
        subject: e.id,
      });
    }

    context.executeAction(
      "guestsetname",
      {
        peep: e.id,
        name: randGuest.name,
      },
      () => {
        applyGuestFlags(e.id, randGuest);
        onSpawned(randGuest);
      },
    );
  });
}
