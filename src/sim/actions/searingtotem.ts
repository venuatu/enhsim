import Action from "../action";
import State from "../state";
import FlameShock from "./flameshock";

export const fireTotems = new Set([
  "totemsearing",
  "totemmagma",
  "totemfirenova",
  "totemfireelemental",
]);
export const ignoreFireTotems = new Set([
  "totemfirenova",
  "totemfireelemental",
]);
export function updateFireTotems(state: State, nextTick: number) {
  for (let act of state.actions) {
    if (fireTotems.has(act.name)) {
      let t = act as SearingTotem;
      t.nextTick = nextTick;
      //@ts-ignore
      if (t.cooldown) t.nextTick = t.cooldown;
    }
  }
}

export default class SearingTotem implements Action {
  name = "totemsearing";
  nextTick = 0;
  needsGCD = true;
  expires = 0;

  run(state: State): boolean {
    if (ignoreFireTotems.has(state.activeTotems.fire)) {
      return false;
    }
    if (state.activeTotems.fire !== this.name || this.expires < state.time) {
      state.activeTotems.fire = this.name;
      updateFireTotems(state, 3000 + state.time);
      this.expires = state.time + 60000;
      return true;
    }
    let mod = state.cast();
    let sp = state.stats.statSpellDamage + state.stats.statAttackPower * 0.3;
    state.newHit(
      mod * (50 + 16 * Math.random() + sp * 0.1667),
      this.name,
      "fire"
    );

    updateFireTotems(state, 3000 + state.time);
    return false;
  }
}
