import { SecretGuest, SECRET_GUESTS } from "./guests";
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
}

export function getCurrentSecretCount(name: string): number {
  return map.getAllEntities("guest").filter((guest) => guest.name === name)
    .length;
}

export function getTotalSecretCount(): number {
  return map
    .getAllEntities("guest")
    .filter((guest) => SECRET_GUESTS.some((sg) => sg.name === guest.name))
    .length;
}

export function getEligibleGuests(): SecretGuest[] {
  const blacklistedNames = getBlacklistNames();
  const maxPerName = getSpawnCountPerName();
  const maxTotal = getSpawnCountTotal();

  if (getTotalSecretCount() >= maxTotal) {
    return [];
  }

  return SECRET_GUESTS.filter(
    (guest) =>
      blacklistedNames.indexOf(guest.name) === -1 &&
      getCurrentSecretCount(guest.name) < maxPerName,
  );
}

export function getRandomGuest(guests: SecretGuest[]): SecretGuest | null {
  if (guests.length === 0) {
    return null;
  }

  return guests[Math.floor(Math.random() * guests.length)];
}

// CAN overwrite existing spawned guests with different names
export function spawnGuest(
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
  });
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

      for (let i = 0; i < event.args.flags.length; i++) {
        peep.setFlag(event.args.flags[i], true);
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

    const randGuest = getRandomGuest(getEligibleGuests());

    if (randGuest === null) {
      return;
    }

    if (getNotifyOnSpawn()) {
      park.postMessage({
        type: "peep",
        text: `${guest.name} was renamed to ${randGuest.name}`,
        subject: guest.id,
      });
    }

    context.executeAction(
      "guestsetname",
      {
        peep: guest.id,
        name: randGuest.name,
      },
      () => {
        applyGuestFlags(e.id, randGuest);
        onSpawned(randGuest);
      },
    );
  });
}
