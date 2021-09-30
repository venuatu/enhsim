import Item from "./item";

export default class Buff {
  name: string;
  start: number = 0;
  expires: number = Infinity;
  stats: Item;
  stacks: number = 0;
  lastFlurry: number;

  public constructor(init?: Partial<Buff>) {
    Object.assign(this, init);
  }
}

export const MarkOfTheWild = new Buff({
  name: "motw",
  stats: {
    statStrength: 14,
    statAgility: 14,
    statStamina: 14,
    statIntellect: 14,
    statSpirit: 14,
  },
});
export const ImpMarkOfTheWild = new Buff({
  name: "imotw",
  stats: {
    statStrength: 18.9,
    statAgility: 18.9,
    statStamina: 18.9,
    statIntellect: 18.9,
    statSpirit: 18.9,
  },
});
// export const InsectSwarm = new Buff({ name: 'is', stats: { statHit: 2 * 15.76 }});
export const FaerieFire = new Buff({
  name: "ff",
  stats: { statArmorPen: 610 },
});
export const ImpFaerieFire = new Buff({
  name: "ff",
  stats: { statArmorPen: 610, statHit: 3 * 15.76 },
});
export const LeaderOfThePack = new Buff({
  name: "lotp",
  stats: { statCrit: 5 * 22.08 },
});

export const FerociousInspiration = new Buff({
  name: "fi",
  stats: { statDmg: 0.03 },
});
export const TrueshotAura = new Buff({
  name: "ta",
  stats: { statAttackPower: 120 },
});
export const ExposeWeaknessP1 = new Buff({
  name: "ew",
  stats: { statAttackPower: ((757 + 107.5) * 1.1) / 4 },
});
export const ExposeWeaknessP2 = new Buff({
  name: "ew",
  stats: { statAttackPower: ((805 + 107.5) * 1.1) / 4 },
});
export const ExposeWeaknessP3 = new Buff({
  name: "ew",
  stats: { statAttackPower: ((839 + 107.5) * 1.1) / 4 },
});
export const ExposeWeaknessP4 = new Buff({
  name: "ew",
  stats: { statAttackPower: ((837 + 107.5) * 1.1) / 4 },
});
export const ExposeWeaknessP5 = new Buff({
  name: "ew",
  stats: { statAttackPower: ((927 + 107.5) * 1.1) / 4 },
});

export const ArcaneIntellect = new Buff({
  name: "ai",
  stats: { statIntellect: 40 },
});

export const BlessingOfMight = new Buff({
  name: "bom",
  stats: { statAttackPower: 220 },
});
export const ImpBlessingOfMight = new Buff({
  name: "ibom",
  stats: { statAttackPower: 264 },
});
export const BlessingOfKings = new Buff({ name: "bok", stats: { kings: 1 } });
export const BlessingOfWisdom = new Buff({
  name: "bow",
  stats: { statPowerRegen: 41 },
});
export const ImpSanctityAura = new Buff({
  name: "isa",
  stats: { statDmg: 0.02 },
});
//TODO: judge wis

export const Fortitude = new Buff({ name: "fort", stats: { statStamina: 79 } });
export const ImpFortitude = new Buff({
  name: "fort",
  stats: { statStamina: 102.7 },
});
export const Misery = new Buff({ name: "mis", stats: { statDmgMagic: 0.05 } });
//TODO: vamptouch

export const ExposeArmor = new Buff({
  name: "ea",
  stats: { statArmorPen: 2050 },
});
export const ImpExposeArmor = new Buff({
  name: "iea",
  stats: { statArmorPen: 3075 },
});
//TODO: hemo

export const Earth = new Buff({ name: "te", stats: { statStrength: 86 } });
export const EnhEarth = new Buff({
  name: "tee",
  stats: { statStrength: 86 * 1.15 },
});
export const EnhT4Earth = new Buff({
  name: "tee",
  stats: { statStrength: 86 * 1.15 + 12 },
});
export const GraceAir = new Buff({ name: "ta", stats: { statAgility: 77 } });
export const EnhGraceAir = new Buff({
  name: "tae",
  stats: { statAgility: 77 * 1.15 },
});
export const Bloodlust = new Buff({
  name: "bloodlust",
  expires: 40000,
  stats: { statHaste: 30 * 15.76, statHasteSpell: 30 * 15.76 },
});
export const ManaSpring = new Buff({
  name: "tm",
  stats: { statPowerRegen: (20 / 2) * 5 },
});
export const RestoManaSpring = new Buff({
  name: "tmr",
  stats: { statPowerRegen: (20 / 2) * 5 * 1.25 },
});
export const WrathAir = new Buff({
  name: "twa",
  stats: { statSpellDamage: 101 },
});
export const T4WrathAir = new Buff({
  name: "twae",
  stats: { statSpellDamage: 121 },
});
export const Wrath = new Buff({
  name: "tw",
  stats: { statCritSpell: 3 * 15.76, statHitSpell: 3 * 15.76 },
});
//TODO: stormstrike

export const BloodPact = new Buff({ name: "bp", stats: { statStamina: 70 } });
export const ImpBloodPact = new Buff({
  name: "bp",
  stats: { statStamina: 91 },
});
// export const CurseElements = new Buff({ name: 'cr', stats: { statArmorPen: 800 }});
export const CurseReck = new Buff({ name: "cr", stats: { statArmorPen: 800 } });

export const BattleShout = new Buff({
  name: "bs",
  stats: { statAttackPower: 306 },
});
export const ComBattleShout = new Buff({
  name: "bsc",
  stats: { statAttackPower: 382.5 },
});
export const SunderArmor = new Buff({
  name: "sun",
  stats: { statArmorPen: 2600 },
});
export const BloodFrenzy = new Buff({
  name: "bf",
  stats: { statDmgPhysical: 0.04 },
});

export const CommonBuffs = [
  // MarkOfTheWild,
  ImpMarkOfTheWild,
  // InsectSwarm,
  // FaerieFire,
  ImpFaerieFire,
  LeaderOfThePack,
  FerociousInspiration,
  FerociousInspiration,
  FerociousInspiration,
  ExposeWeaknessP2,
  // TrueshotAura,
  // ExposeWeakness,
  ArcaneIntellect,
  // BlessingOfMight,
  ImpBlessingOfMight,
  BlessingOfKings,
  BlessingOfWisdom,
  // ImpSanctityAura,
  // Fortitude,
  ImpFortitude,
  Misery,
  // ExposeArmor,
  ImpExposeArmor,
  // Earth,
  EnhEarth,
  // EnhT4Earth,
  // GraceAir,
  EnhGraceAir,
  Bloodlust,
  ManaSpring,
  RestoManaSpring,
  // WrathAir,
  // T4WrathAir,
  // Wrath,
  // BloodPact,
  // ImpBloodPact,
  // CurseElements,
  CurseReck,
  // BattleShout,
  ComBattleShout,
  // SunderArmor,
  BloodFrenzy,
];

export const SelfBuffs = [
  // Earth,
  EnhEarth,
  // EnhT4Earth,
  // GraceAir,
  EnhGraceAir,
  Bloodlust,
  ManaSpring,
  RestoManaSpring,
  // WrathAir,
  // T4WrathAir,
  // Wrath,
];

export const ThunderingStrikes = new Buff({
  name: "ts",
  stats: { statCrit: 5 * 22.08 },
});
//11000 for 2.7 * 4, mainly so it shows up in uptime
export const Flurry = new Buff({
  name: "flurry",
  stats: { statHaste: 30 * 15.76 },
  stacks: 4,
  lastFlurry: 0,
  expires: 11000,
});
export const DWSpec = new Buff({ name: "dws", stats: { statHit: 6 * 15.76 } });
export const UnleashedRage = new Buff({
  name: "unleashedRage",
  stats: { unleashedRage: 1 },
  expires: 10000,
});
export const NaturesGuidance = new Buff({
  name: "ng",
  stats: { statHit: 3 * 15.76, statHitSpell: 3 * 15.76 },
});
export const MentalQuickness = new Buff({
  name: "mq",
  stats: { mentalQuickness: 1 },
});
export const WeaponMaster = new Buff({
  name: "wm",
  stats: { statDmgPhysical: 0.1 },
});

export const Talents = [
  ThunderingStrikes,
  // Flurry,
  DWSpec,
  // UnleashedRage,
  NaturesGuidance,
  MentalQuickness,
];
