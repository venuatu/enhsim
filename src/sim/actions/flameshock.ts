import Action from "../action";
import State from "../state";
import { updateShocks } from "./earthshock";

export default class FlameShock implements Action {
  name = "shockflame";
  nextTick = 0;
  needsGCD = true;
  lastShock = 0;

  run(state: State): boolean {
    let mod = state.cast();
    if (!mod) return true;
    let sp = state.stats.statSpellDamage;
    state.newHit(
      mod * (377 + sp * (1.5 / 3.5)) + (420 + 0.4 * (12 / 15)),
      this.name,
      "fire"
    );
    updateShocks(state, 6000 + state.time);
    this.nextTick = 12000 + state.time;
    return true;
  }
}
