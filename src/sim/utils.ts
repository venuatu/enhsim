//@ts-ignore
export const isWorker: boolean =
  typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;

export const setBonuses = [
  {
    id: 633,
    items: [29038, 29039, 29040, 29043, 29042],
    name: "Cyclone Harness",
    spells: [
      { min: 2, statStrength: 12 },
      { min: 4, stormstrikeT4Bonus: 1 },
    ],
  },
  {
    id: 636,
    items: [30185, 30189, 30190, 30192, 30194],
    name: "Cataclysm Harness",
    spells: [{ min: 4, statHaste: 78.8 }],
  },
  {
    id: 682,
    items: [31018, 31011, 31015, 31021, 31024, 34567, 34439, 34545],
    name: "Skyshatter Harness",
    spells: [{ min: 4, statAttackPower: 70 }],
  },
  {
    id: 619,
    items: [29527, 29526, 29525],
    name: "Primal Intent",
    spells: [{ min: 3, statAttackPower: 40 }],
  },
  {
    id: 617,
    items: [29521, 29520, 29519],
    name: "Netherstrike Armor",
    spells: [{ min: 3, statSpellDamage: 23, statSpellHealing: 23 }],
  },
  {
    id: 616,
    items: [29516, 29517, 29515],
    name: "Netherscale Armor",
    spells: [{ min: 3, statHit: 20 }],
  },
];
