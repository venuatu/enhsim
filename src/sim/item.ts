export interface FullSpell {
  name: string;
  trigger: string;
  ppm: number;
  cd: number;
  duration: number;
  nextUse: number;
  chance: number;

  statArmorPen: number;
  statAttackPower: number;
  statCrit: number;
  statCritSpell: number;
  statCritStack: number; //worldbreaker
  statHaste: number;
  statHasteMelee: number;
  statHasteSpell: number;
  statMeleeAttackPowerVersus: number;
  statPeriodicDamage: number;
  statPeriodicDamagePercent: number;
  // statPeriodicTriggerSpell: number;
  // statProcSpell: number;
  // statProcTriggerSpell: number;
  statSpellCritChance: number;
  statSpellDamage: number;
  statSpellHealing: number;
  statSpellHit: number;
}
export type Spell = Partial<FullSpell>;

export interface FullItem {
  id: number;
  ilvl: number;
  rlvl: number;
  name: string;
  slot: string;
  type: string;
  phase: number;
  dmgMin: number;
  dmgMax: number;
  speed: number;

  spells: Array<Spell>;

  //TODO: more stats
  statArmorPen: number;
  statSpellPenetration: number;

  statAgility: number;
  statAttackPower: number;
  statBlock: number;
  statBlockValue: number;
  statCrit: number;
  statCritSpell: number;
  statDefense: number;
  statDetect: number;
  statDodge: number;
  statDummy: number;
  statExpertise: number;
  statFarSight: number;
  statHaste: number;
  statHasteSpell: number;
  statHit: number;
  statHitSpell: number;
  statIncreaseHealth2: number;
  statIntellect: number;
  statMechanicImmunity: number;
  statOverrideClassScripts: number;
  statParry: number;
  statPowerRegen: number;
  statProcSpell: number;
  statProcTriggerSpell: number;
  statResilience: number;
  statResistance: number;
  statSpellDamage: number;
  statSpellHealing: number;
  statSpellHit: number;
  statSpirit: number;
  statStamina: number;
  statStat: number;
  statStrength: number;
  statTargetResistance: number;
  statTrackCreatures: number;

  kings: number;
  statCritKings: number;
  statAttackPowerKings: number;
  unleashedRage: number;
  mentalQuickness: number;
  statDmg: number;
  statDmgPhysical: number;
  statDmgMagic: number;
  statDmgCrit: number;
  armorReduction: number;

  target: Item; // skip the proxy
}
type Item = Partial<FullItem>;
export default Item;

export const gearBySlot: Record<string, Array<Item>> = {};
export const gearById: Record<string, Item> = {};

let goodprops = [
  { prop: "statAgility", name: "Agility" },
  { prop: "statArmorPen", name: "ArPen" },
  { prop: "statAttackPower", name: "Attack Power" },
  { prop: "statCrit", name: "Crit" },
  { prop: "statExpertise", name: "Expertise" },
  { prop: "statHaste", name: "Haste" },
  { prop: "statHit", name: "Hit" },
  { prop: "statStrength", name: "Strength" },
  { prop: "spells", name: "spell" },
];

//@ts-ignore
import gearUrl from "../gear.json?url";

let myclass = 64;
let gr;
let grp;

export function populateGear() {
  if (gr) return Promise.resolve(true);
  if (grp) return grp;
  let maxPhase = JSON.parse(localStorage.enhsimFlags).maxPhase;
  grp = fetch(gearUrl)
    .then((r) => {
      return r.json();
    })
    .then((items) => {
      for (const v of items) {
        if (v.phase > maxPhase) continue;
        if (!gearBySlot[v.slot]) {
          gearBySlot[v.slot] = [];
        }
        gearBySlot[v.slot].push(v);
        gearById[v.id] = v;
        for (let sock of v.sockets || []) {
          if (sock == "meta") {
            v.statAgility = (v.statAgility || 0) + 12;
            v.statDmgCrit = (v.statDmgCrit || 0) + 0.03;
          } else {
            v.statStrength = (v.statStrength || 0) + 8;
          }
        }
      }
      gr = items;
      grp = null;
      return true;
    });
  return grp;
}
