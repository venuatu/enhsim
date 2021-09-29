import { chain, cloneDeep } from "lodash";
import Action from "../action";
import Buff from "../buff";
import { gearById, Spell } from "../item";
import State from "../state";
import { isWorker } from "../utils";
import WeaponMain, { decrementFlurry } from "./weaponmain";

let extraSpells: Record<string, Array<Spell>> = {
  "28830": [
    { trigger: "physical", statHaste: 325, cd: 20, duration: 10, ppm: 1.3 },
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
};

export default class Trinkets implements Action {
  name = "trinkets";
  nextTick = 0;
  needsGCD = false;

  spells: Record<string, Array<Spell>> = null;

  procPhysical(state: State) {
    let ps = this.spells["physical"];
    if (!ps) return;
    for (let i = 0; i < ps.length; i++) {
      let sp = ps[i];
      if (sp.nextUse && sp.nextUse >= state.time) continue;
      if (sp.chance && Math.random() > sp.chance) continue;
      let b = new Buff({
        name: sp.name,
        start: state.time,
        expires: state.time + sp.duration * 1000,
        stats: sp,
      });
      state.buffs.push(b);
      // if (!isWorker) console.log('trinket procPhysical', b);
      state.buffsDirty = true;
      sp.nextUse = state.time + sp.cd * 1000;
    }
  }

  procPhysicalCrit(state: State) {
    let ps = this.spells["physicalCrit"];
    if (!ps) return;
    for (let i = 0; i < ps.length; i++) {
      let sp = ps[i];
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

  procSpell(state: State) {}

  procSpellCrit(state: State) {}

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
          s.name = item.name || "item " + it;
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
