export default [
  {
    difficulty: 1,
    title: [
      "Welcome to the Airtasker 404 Game",
      "It's complex. You have to fly and land the Airtasker Shoe safely.",
      "Any resemblance to an existing game is purely coincidental.",
    ],
    gravity: 0.002,
    fuel: 1500,
    wind: 0,
    platforms: [
      {
        w: 150,
        x: 0.7,
      },
    ],
  },

  {
    difficulty: 2,
    title: ["This time you have to deliver a package.", "Pick it up first!"],
    gravity: 0.005,
    fuel: 2000,
    wind: 0,
    platforms: [
      {
        w: 150,
        x: 0.5,
        pickup: "glasses",
      },
      {
        w: 150,
        x: 0.7,
        dropoff: "glasses",
      },
    ],
  },

  {
    difficulty: 4,
    title: ["Land safely.", "Gravity is getting a bit stronger."],
    gravity: 0.013,
    fuel: 1500,
    wind: 0,
    platforms: [
      {
        w: 100,
        x: 0.2,
      },
    ],
  },

  {
    difficulty: 5,
    title: ["Watch out for the wind."],
    gravity: 0.025,
    fuel: 1000,
    wind: -0.005,
    platforms: [
      {
        w: 80,
        x: 0.2,
      },
    ],
  },

  {
    difficulty: 7,
    title: ["You have to deliver a package again..."],
    gravity: 0.02,
    fuel: 2000,
    wind: 0.007,
    platforms: [
      {
        w: 100,
        x: 0.2,
        dropoff: "monkeys",
      },
      {
        w: 100,
        x: 0.8,
        pickup: "monkeys",
      },
    ],
  },

  {
    difficulty: 10,
    title: ["Things are getting a bit tough."],
    gravity: 0.035,
    fuel: 2000,
    wind: 0.01,
    platforms: [
      {
        w: 50,
        x: 0.2,
      },
    ],
  },

  {
    difficulty: 20,
    title: ["Ok, this is mostly impossible.", "Good luck!"],
    gravity: 0.045,
    fuel: 1000,
    wind: 0,
    platforms: [
      {
        w: 30,
        x: 0.8,
        bouncy: true,
      },
    ],
  },
];
