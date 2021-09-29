import { forEach, cloneDeep, chain, intersection, keys, map } from "lodash";
import Action from "./action";
import EarthShock from "./actions/earthshock";
import FireNovaTotem from "./actions/firenovatotem";
import FlameShock from "./actions/flameshock";
import MagmaTotem from "./actions/magmatotem";
import SearingTotem from "./actions/searingtotem";
import StormStrike from "./actions/stormstrike";
import StormStrikeAfterWF from "./actions/stormstrikeafterwf";
import Trinkets from "./actions/trinkets";
import WeaponMain from "./actions/weaponmain";
import WeaponOff from "./actions/weaponoff";
import Buff, {
  CommonBuffs,
  Flurry,
  SelfBuffs,
  Talents,
  UnleashedRage,
} from "./buff";
import { SelectedGems } from "./gems";
import Hit, { Schools } from "./hit";
import Item, { gearById } from "./item";
import { isWorker, setBonuses } from "./utils";

export default class State {
  level: number = 70;
  targetLevel: number = 73;
  maxTime: number = 120 * 1000;

  nextGCD: number = 0;
  time: number = 0;

  baseBuffs: Array<Buff> = [].concat(
    // SelfBuffs,
    CommonBuffs,
    Talents,
    SelectedGems
  );
  buffs: Array<Buff> = [].concat();
  buffsDirty: boolean = true;
  expiredBuffs: Array<Buff> = [];
  private baseStats: Item;
  addedStats: Item = this.newStatsObj();

  damage: Array<Hit> = [];

  // calculated on tick
  stats: Item = {};

  annoyance = {
    ohDelay: 0,
  };

  // getStat(name: string): number {
  //     let st = this.stats[name]
  //     return st || 0;
  // }

  dualWield: true;

  flags = {
    parry: false,
    tickMS: 50,
    log: false,
    armor: 7700,
  };

  actions = [
    new Trinkets(),
    new WeaponMain(),
    new WeaponOff(),
    new FlameShock(),
    new FireNovaTotem(),
    // new SearingTotem(),
    new MagmaTotem(),
    // new StormStrikeAfterWF(),
    new StormStrike(),
    new EarthShock(),
  ];
  actMap: Record<string, Action> = {};

  gear: Array<Item> = [];

  activeTotems: Record<string, string> = {
    air: null,
    earth: null,
    fire: null,
    water: null,
  };

  constructor() {
    for (let act of this.actions) {
      this.actMap[act.name] = act;
    }
  }

  report() {
    let dmg = 0;
    let dmgSpells: Record<string, number> = {};
    for (let d of this.damage) {
      dmg += d.amount;
      dmgSpells[d.from] = (dmgSpells[d.from] || 0) + d.amount;
    }
    let secs = this.maxTime / 1000;

    let dps = dmg / secs;
    let dmgdps: Record<string, any> = {};
    for (let [k, v] of Object.entries(dmgSpells)) {
      dmgdps[k] = (v / secs / dps) * 100; //.toFixed(2) + '%';
    }

    let uptime = {};
    for (let b of this.buffs.concat(this.expiredBuffs)) {
      if (b.expires == Infinity) continue;
      let dur = b.expires - b.start;
      uptime[b.name] = (uptime[b.name] || 0) + dur / this.maxTime;
    }
    forEach(uptime, (v, k) => {
      uptime[k] = v * 100; //.toFixed(0) + '%';
    });
    return {
      dps,
      uptime,
      breakdownDps: dmgdps,
      duration: this.duration,
      annoyance: this.annoyance,
    };
  }

  duration: number = 0;

  run() {
    let start = performance.now();
    while (this.tick()) {
      if (this.flags.log) {
        console.log("tick");
      }
    }
    this.duration = performance.now() - start;
  }

  tick() {
    let time = this.time;
    let openGCD = this.nextGCD <= time;
    this.calculateStats();
    let earliestTick = this.maxTime;

    for (let act of this.actions) {
      if (time >= act.nextTick && (act.needsGCD ? openGCD : true)) {
        let result = act.run(this);
        if (result && act.needsGCD) {
          this.nextGCD = time + 1500;
          break;
        }
      }
    }
    earliestTick = chain(this.actions)
      .map("nextTick")
      .concat([this.nextGCD])
      .filter((x) => x > this.time)
      .min()
      .value();
    this.time = earliestTick;
    return this.time < this.maxTime;
  }

  weapons: Array<Item> = [];
  lastBuffs: Array<Buff> = [];

  calculateStats() {
    // "statPeriodicEnergize"
    // "statPowerRegen"
    // "statSpirit"
    // "statProcTriggerSpell"
    // "statRangedAttackPower"
    // "statRangedHaste"
    // "statPeriodicTriggerSpell"
    // "statRating"
    // "statShieldBlockvalue"
    let prevBuffs = this.buffs;
    this.buffs = [];
    for (let b of prevBuffs) {
      if (b.expires < this.time) {
        this.expiredBuffs.push(b);
        this.buffsDirty = true;
      } else {
        this.buffs.push(b);
      }
    }
    if (!this.buffsDirty) {
      return;
    }
    if (!this.baseStats) {
      this.baseStats = this.newStatsObj();
      this.baseStats.statStrength = 103;
      this.baseStats.statAgility = 61;
      this.baseStats.statStamina = 113;
      this.baseStats.statIntellect = 109;
      this.baseStats.statSpirit = 122;

      for (let sb of setBonuses) {
        let crossover = intersection(sb.items, map(this.gear, "id")).length;
        if (crossover <= 0) continue;
        for (let sp of sb.spells) {
          if (crossover < sp.min) continue;
          if (!isWorker) console.log("setbonus", crossover, sb.name, sp);
          this.mergeStats(this.baseStats, sp);
        }
      }

      for (let b of this.baseBuffs) {
        this.mergeStats(this.baseStats, b.stats);
      }

      for (let item of this.gear) {
        // let item = gearById[i];
        if (!isWorker) console.log("item", (item || {}).name, item);
        if (!item) {
          continue;
        }
        if (item.speed) {
          this.weapons.push(item);
        }
        this.mergeStats(this.baseStats, item);
      }
      if (!isWorker) console.log(this.baseStats.target);
    }
    this.stats = this.newStatsObj();
    let sts = this.stats;
    this.applySpell(this.baseStats.target);
    this.lastBuffs = this.buffs;
    for (let buff of this.buffs) {
      this.applySpell(buff.stats);
    }
    this.applySpell(this.addedStats.target);
    if (sts.kings) {
      sts.statCrit = sts.statCrit + sts.statCritKings;
      sts.statAttackPower = sts.statAttackPower + sts.statAttackPowerKings;
    }
    if (sts.unleashedRage) {
      sts.statAttackPower = sts.statAttackPower * 1.1;
    }
    if (sts.mentalQuickness) {
      sts.statSpellDamage = sts.statSpellDamage + sts.statAttackPower * 0.3;
    }

    // D11/(D11-22167.5+467.5*73)
    let arp = this.stats.statArmorPen;
    let armor = this.flags.armor - arp;
    let reduction = armor / (armor - 22167.5 + 467.5 * 73);
    this.stats.armorReduction = 1 - reduction;
    // if (!isWorker) console.log('arp', this.stats.armorReduction, arp);
    // debugger;
    this.buffsDirty = false;
  }

  newStatsObj(): Item {
    let handler = {
      get: function (target, name) {
        return target[name] || 0;
      },
    };
    let o = {};
    let p = new Proxy(o, handler);
    p.target = o;
    return p;
  }

  mergeStats(l: Item, r: Item) {
    for (let k of keys(r)) {
      if (!k.startsWith("stat")) continue;
      l[k] = (l[k] || 0) + r[k];
    }
  }

  applySpell(o: Item, sts: Item = null) {
    sts = sts || this.stats;
    for (let k of keys(o)) {
      if (!k.startsWith("stat")) continue;
      this.applyStat(k, o[k], sts);
    }
  }

  applyStat(k: string, v: number, sts: Item = null): void {
    // if (!isWorker) console.log('applyStat', k, v, sts);
    sts = sts || this.stats;
    switch (k) {
      case "statAgility":
        // sts.statAgility = v + sts.statAgility;
        sts.statCrit = v / 25 / 100 + sts.statCrit;
        sts.statCritKings = (v / 25 / 100) * 0.1 + sts.statCritKings;
        break;
      case "statCrit":
        sts.statCrit = v / 22.08 / 100 + sts.statCrit;
        break;
      case "statExpertise":
        sts.statExpertise = v / 14.7904396057 / 100 + sts.statExpertise;
        break;
      case "statHit":
        sts.statHit = v / 15.76 / 100 + sts.statHit;
        break;
      case "statHaste":
        sts.statHaste = v / 15.76 / 100 + sts.statHaste;
        break;
      case "statStrength":
        sts.statAttackPower = v * 2 + sts.statAttackPower;
        sts.statAttackPowerKings = v * 0.2 + sts.statAttackPowerKings;
        break;
      case "statHasteSpell":
        sts.statHasteSpell = v / 15.76 / 100 + sts.statHasteSpell;
        break;
      case "statHitSpell":
        sts.statHitSpell = v / 15.76 / 100 + sts.statHitSpell;
        break;
      case "statCritSpell":
        sts.statCritSpell = v / 15.76 / 100 + sts.statCritSpell;
        break;
      // case "statIncreaseSpeed":
      //     sts.statIncreaseSpeed = v / 15.76 + sts.statIncreaseSpeed;
      //     break
      case "statStamina":
        sts.statStamina = v * 10 + sts.statStamina;
        break;
      case "statIntellect":
        sts.statIntellect = v * 15 + sts.statIntellect;
        sts.statCritSpell = v / 78.1 / 100 + sts.statCritSpell;
        break;
      case "statSpellPenetration":
        sts.statSpellPenetration = v + sts.statSpellPenetration;
        break;
      default:
        // if (!isWorker) console.log('applyStatDefault', k, v);
        sts[k] = v + sts[k];
        break;
    }
  }

  lastWindfury: number = 0;

  procPhysical(prevWF: boolean = false) {
    if (!prevWF && this.time - this.lastWindfury > 3000) {
      if (Math.random() <= 0.36) {
        this.lastWindfury = this.time;
        let ap = this.stats.statAttackPower + 475;
        let mh = this.actMap["mainhand"] as WeaponMain;
        this.newHit(
          this.swing() * (mh.calculateSwing(this) + ap / 14) * 1.4,
          "windfury",
          "physical",
          false
        );
        this.newHit(
          this.swing() * (mh.calculateSwing(this) + ap / 14) * 1.4,
          "windfury",
          "physical",
          false
        );
      }
    }
    (this.actMap["trinkets"] as Trinkets).procPhysical(this);
  }

  procPhysicalCrit() {
    const refresh = {
      [Flurry.name]: Flurry,
      [UnleashedRage.name]: UnleashedRage,
    };
    for (let x of this.buffs) {
      if (refresh[x.name]) {
        x.expires = refresh[x.name].expires + this.time;
        if (x.name == Flurry.name) {
          x.stacks = 4;
        }
        delete refresh[x.name];
      }
    }
    forEach(refresh, (v) => {
      this.buffsDirty = true;
      let o = cloneDeep(v);
      o.expires += this.time;
      o.start = this.time;
      this.buffs.push(o);
    });
    (this.actMap["trinkets"] as Trinkets).procPhysicalCrit(this);
  }

  procSpell() {
    (this.actMap["trinkets"] as Trinkets).procSpell(this);
  }

  procSpellCrit() {
    (this.actMap["trinkets"] as Trinkets).procSpellCrit(this);
  }

  newHit(
    amount: number,
    from: string,
    type: string,
    proc: boolean = true
  ): void {
    if (amount <= 0) return;
    let hit: Hit = {
      amount,
      from,
      type: type as Schools,
      time: this.time,
    };
    this.damage.push(hit);
    if (type == "physical") {
      this.procPhysical(!proc);
    } else {
      this.procSpell();
    }
    if (this.flags.log) console.log(hit);
  }

  swing(auto = false) {
    let rng = Math.random() - 0.01;
    let hitmod = auto ? 0.26 : 0.08;
    rng -= Math.max(0, hitmod - this.stats.statHit);
    // if (!isWorker) console.log('statHit', Math.max(0, hitmod - this.stats.statHit))
    if (rng <= 0) {
      return 0;
    }
    rng -= Math.max(0, 0.065 - this.stats.statExpertise);
    // if (!isWorker) console.log('statExpertise', Math.max(0, 0.075 - this.stats.statExpertise))
    if (rng <= 0) {
      return 0;
    }
    if (this.flags.parry) {
      rng -= Math.max(0, 0.14 - this.stats.statExpertise);
      // if (!isWorker) console.log('statExpertise', Math.max(0, 0.145 - this.stats.statExpertise))
      if (rng <= 0) {
        return 0;
      }
    }
    let dmgmod =
      (1 + this.stats.statDmg + this.stats.statDmgPhysical) *
      this.stats.armorReduction;
    if (auto) {
      rng -= 0.25;
      // if (!isWorker) console.log('glancing', 0.25, dmgmod)
      if (rng <= 0) {
        return 0.75 * dmgmod;
      }
    }
    //TODO: two roll hits
    rng -= this.stats.statCrit;
    // if (!isWorker) console.log('statCrit', this.stats.statCrit)
    if (rng <= 0) {
      this.procPhysicalCrit();
      return 2 * dmgmod * (1 + this.stats.statDmgCrit);
    }
    return dmgmod;
  }

  cast() {
    let rng = Math.random() - 0.01;
    rng -= Math.max(0, 0.16 - this.stats.statHitSpell);
    // if (!isWorker) console.log('statHitSpell', Math.max(0, 0.13 - this.stats.statHitSpell))
    if (rng <= 0) {
      return 0;
    }
    let dmgmod = 1 + this.stats.statDmg + this.stats.statDmgMagic;
    //TODO: spell penetration
    rng -= Math.max(0, 0.13 - this.stats.statCritSpell);
    // if (!isWorker) console.log('statCritSpell', Math.max(0, 0.13 - this.stats.statCritSpell))
    if (rng <= 0) {
      this.procSpellCrit();
      return 1.5 * dmgmod * (1 + this.stats.statDmgCrit);
    }
    return dmgmod;
  }
}
