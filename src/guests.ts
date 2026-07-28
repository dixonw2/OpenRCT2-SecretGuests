export interface SecretGuest {
  name: string;
  description: string;
  flags?: PeepFlags[];
}

/*
    Custom guest example (in SECRET_GUESTS):
    {
        name: "Test",
        description: "Splashes everyone with a purple paint balloon",
        flags: ["purple"],
    },

    Flags list (untested)
    "leavingPark"
    "slowWalk"
    "tracking"
    "waving"
    "hasPaidForParkEntry"
    "photo"
    "painting"
    "wow"
    "litter"
    "lost"
    "hunger"
    "toilet"
    "crowded"
    "happiness"
    "nausea"
    "purple"
    "pizza"
    "explode"
    "rideShouldBeMarkedAsFavourite"
    "parkEntranceChosen"
    "contagious"
    "joy"
    "angry"
    "iceCream"
    "hereWeAre"
    "positionFrozen"
    "animationFrozen"
*/

export const SECRET_GUESTS: SecretGuest[] = [
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
    //description: "Thinks \u201CIt's too crowded here\u201D",
    description: "Has random thoughts",
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

export const BLACKLIST_GUESTS_NAMES_DEFAULT: string[] = [
  "Katie Rodger",
  "Lisa Stirling",
  "Eilidh Bell",
  "Felicity Anderson",
  "Corina Massoura",
  "Donald MacRae",
];

export const CUSTOM_GUESTS_DEFAULT: SecretGuest[] = [{name: "FleetingDream", description: "His impressive talent astounds all", flags: ["photo", "painting", "waving"]}];
