import { chain, cloneDeep } from "lodash";
import Action from "../action";
import Buff from "../buff";
import { Spell } from "../item";
import State from "../state";
import { isWorker } from "../utils";

let extraSpells: Record<string, Array<Spell>> = {
  "28830": [
    { trigger: "physical", statHaste: 325, cd: 20, duration: 10, ppm: 1 },
  ],
  "30627": [
    {
      trigger: "physicalCrit",
      statAttackPower: 340,
      duration: 10,
      cd: 45,
      chance: 0.1,
    },
  ],
  "30450": [
    {
      trigger: "physical",
      statArmorPen: 1000,
      cd: 30,
      duration: 15,
      chance: 0.25,
    },
  ],
  "28034": [
    {
      trigger: "physicalCrit",
      statAttackPower: 300,
      duration: 10,
      cd: 50,
      chance: 0.1,
    },
  ],
  //TODO: implement refresh prev buff
  "28439": [
    { trigger: "physical", statHaste: 212, ppm: 1, duration: 10, cd: 10 },
  ],
  "28437": [
    { trigger: "physical", statHaste: 212, ppm: 1, duration: 10, cd: 10 },
  ],
  "28438": [
    { trigger: "physical", statHaste: 212, ppm: 1, duration: 10, cd: 10 },
  ],
  "27901": [
    { trigger: "physical", statHaste: 132, ppm: 1.9, duration: 10, cd: 10 },
  ],
  "29962": [
    {
      trigger: "physical",
      statAttackPower: 270,
      ppm: 1.7,
      duration: 10,
      cd: 10,
    },
  ],
  "29348": [
    { trigger: "physical", statHaste: 180, ppm: 3, duration: 10, cd: 45 },
  ],
  //TODO: implement stack limits
  "31331": [
    { trigger: "physical", statArmorPen: 435, chance: 0.07, duration: 10 },
  ],
  "21670": [{ statArmorPen: 200 * 6, duration: 27, cd: 180 }],
  "31856": [
    { trigger: "physical", statAttackPower: 6 * 20, duration: 300, cd: 300 },
    { trigger: "spell", statSpellDamage: 8 * 10, duration: 300, cd: 300 },
  ],
  //"31857": [{ statDMWrath: 1, duration: 300, cd: 300 }],
  "34427": [
    {
      trigger: "physical",
      statAttackPower: 440,
      chance: 0.1,
      duration: 15,
      cd: 45,
    },
  ],
  "34429": [{ statSpellDamage: 320, duration: 15, cd: 90 }],
  "32505": [{ statArmorPen: 300, ppm: 2, duration: 10 }],
  "28789": [{ statSpellDamage: 300, ppm: 10 * 0.16, duration: 10 }], // 16% missing spell hit
  "32488": [
    { trigger: "spellCrit", statHasteSpell: 145, chance: 0.5, duration: 5 },
  ],
  "30626": [
    {
      trigger: "spellCrit",
      statSpellDamage: 190,
      chance: 0.2,
      duration: 15,
      cd: 45,
    },
  ],
  "32491": [
    { trigger: "stormstrike", statAttackPower: 275, chance: 0.5, duration: 10 },
  ],
  "34472": [
    {
      trigger: "physical",
      statAttackPower: 300,
      chance: 0.1,
      duration: 20,
      cd: 45,
    },
  ],
};

export default class Trinkets implements Action {
  name = "trinkets";
  nextTick = 0;
  needsGCD = false;

  spells: Record<string, Array<Spell>> = null;

  handleProc(state: State, spells: Array<Spell>) {
    for (let i = 0; i < spells.length; i++) {
      let sp = spells[i];
      if (sp.nextUse && sp.nextUse >= state.time) continue;
      if (sp.chance && Math.random() > sp.chance) continue;
      let b = new Buff({
        name: sp.name,
        start: state.time,
        expires: state.time + sp.duration * 1000,
        stats: sp,
      });
      state.buffs.push(b);
      // if (!isWorker) console.log('trinket procPhysicalCrit', b);
      state.buffsDirty = true;
      sp.nextUse = state.time + sp.cd * 1000;
    }
  }

  procPhysical(state: State) {
    let ps = this.spells["physical"];
    if (!ps) return;
    this.handleProc(state, ps);
  }

  procPhysicalCrit(state: State) {
    let ps = this.spells["physicalCrit"];
    if (!ps) return;
    this.handleProc(state, ps);
  }

  procSpell(state: State) {
    let ps = this.spells["spell"];
    if (!ps) return;
    this.handleProc(state, ps);
  }

  procSpellCrit(state: State) {
    let ps = this.spells["spellCrit"];
    if (!ps) return;
    this.handleProc(state, ps);
  }

  run(state: State): boolean {
    if (this.spells === null) {
      this.spells = {};
      for (let item of state.gear) {
        // let item = gearById[it];
        let sps = item.spells || [];
        if (extraSpells[item.id]) {
          sps = sps.concat(extraSpells[item.id]);
        }
        if (!sps) continue;
        for (let s of sps) {
          s = cloneDeep(s);
          let trig = s.trigger || "use";
          s.name = item.name || "item " + item.id;
          if (!this.spells[trig]) {
            this.spells[trig] = [];
          }
          if (s.ppm) {
            s.chance = s.ppm / (60000 / state.weapons[0].speed);
          }
          if (s.cd && !s.duration) {
            s.duration = s.cd;
          }
          this.spells[trig].push(s);
        }
      }
      if (!isWorker) console.log("trinkets", this.spells);
    }

    if (!this.spells["use"]) {
      this.nextTick = Infinity;
      return false;
    }

    for (let i = 0; i < this.spells["use"].length; i++) {
      let sp = this.spells["use"][i];
      // if (!isWorker) console.log('trinkuse', sp, sp.nextUse, state.time / 1000);
      if (sp.nextUse && sp.nextUse >= state.time) continue;
      let b = new Buff({
        name: sp.name,
        start: state.time,
        expires: state.time + sp.duration * 1000,
        stats: sp,
      });
      state.buffs.push(b);
      // if (!isWorker) console.log('trinket pop', b);
      state.buffsDirty = true;
      sp.nextUse = state.time + sp.cd * 1000;
      this.nextTick = state.time + 30000;
      return false;
    }
    this.nextTick = chain(this.spells["use"]).map("nextUse").min().value();
    return false;
  }
}
