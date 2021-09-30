import Action from "../action";
import State from "../state";
import FlameShock from "./flameshock";

const shockNames = new Set(["shockearth", "shockflame"]);
export function updateShocks(state: State, nextTick: number) {
  for (let act of state.actions) {
    if (shockNames.has(act.name)) (act as EarthShock).nextTick = nextTick;
  }
}

export default class EarthShock implements Action {
  name = "shockearth";
  nextTick = 0;
  needsGCD = true;
  lastShock = 0;

  run(state: State): boolean {
    let mod = state.cast();
    //TODO: stormstrike buff
    state.newHit(
      mod *
        (661 + 35 * Math.random() + state.stats.statSpellDamage * (1.5 / 3.5)),
      this.name,
      "nature"
    );
    updateShocks(state, 6000 + state.time);
    return true;
  }
}
