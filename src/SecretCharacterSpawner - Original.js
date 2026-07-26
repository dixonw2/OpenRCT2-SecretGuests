registerPlugin({
    name: "SecretCharacterSpawner",
    version: "1.6",
    authors: ["Sun"],
    type: "local",
    licence: "MIT",

    main: function () {

        const secretChance = 0.5; // Percent Chance of Secret Character Spawn
		
        const secretNames = [
			//RCT1
            "Chris Sawyer",			//Photographs, Drives Fast 	-- Programmer
            "Simon Foster",			//Paints					-- Art Designer
			"David Ellis",			//"And here we are on..."	-- Sound Designer
			
			"Emma Garrell",			//Gifts Purple Clothes
			"Felicity Anderson",	//Causes Vomit on Others
			"John Wardley",			//"Wow"
            "Katie Brayshaw",		//Frequently Waves
			"Katie Smith",			//Frequently Jumps
			"Lisa Stirling",		//Litters
			"Nancy Stillwagon",		//Gifts Ice Cream
			
			//RCT2
			"Carol Young",			//Decreasing Happiness
			"Corina Massoura",		//"It's too crowded here."
			"Donald MacRae",		//"Im lost!"
			"Frances McGowan",		//Frequently uses Bathroom
			"Katherine McGowan",	//Frequently Eats
			"Mia Sheridan",			//Increasing Nausea
			"Melanie Warn",			//Happy+Energy, no Nausea
			"Joanne Barton",		//Gifts Pizza
			"John Mace",			//Pays Double for Rides
			"Eilidh Bell",			//Vandalizes
			"Katie Rodger",			//Wants to Leave
			
			//Karting
            "Mr. Bean",				//Drives Slow
			"Jacques Villeneuve",	//Drives Faster
			"Michael Schumacher",	//Drives Even Faster
            "Damon Hill"			//Drives Fastest
        ];

        let checkedGuests = new Set();
		let initialScan = true;
		
        let tickCounter = 0;
        const TICKS_PER_CHECK = 40;

        context.subscribe("interval.tick", function () {
			
			tickCounter++;
            if (tickCounter < TICKS_PER_CHECK) {
                return;
            }
            tickCounter = 0;
			
            let guests = map.getAllEntities("guest");

            for (let i = 0; i < guests.length; i++) {
                let guest = guests[i];

                if (checkedGuests.has(guest.id)) {
                    continue;
                }

                checkedGuests.add(guest.id);
				
				// First pass only flags guests
				if (initialScan) {
					continue;
				}

                if (Math.random() * 100 < secretChance) {

                    // Start with all names available
                    let availableNames = secretNames.slice();

                    // Remove names already in use
                    for (let j = 0; j < guests.length; j++) {
                        let existingName = guests[j].name;
                        let index = availableNames.indexOf(existingName);

                        if (index !== -1) {
                            availableNames.splice(index, 1);
                        }
                    }

                    // Only assign if at least one name is left
                    if (availableNames.length > 0) {
                        let randomName = availableNames[
                            Math.floor(Math.random() * availableNames.length)
                        ];

						context.executeAction("guestsetname", {
						peep: guest.id,
						name: randomName
						});
                    }
                }
            }
		// After first full pass, begin normal behavior
		initialScan = false;
        });
        ui.showMessage("Secret Character Spawner loaded!");
    }
});