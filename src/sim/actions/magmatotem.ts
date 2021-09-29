import Action from "../action";
import State from "../state";
import { ignoreFireTotems, updateFireTotems } from "./searingtotem";

export default class MagmaTotem implements Action {
  name = "totemmagma";
  nextTick = 0;
  needsGCD = true;
  expires = 0;

  run(state: State): boolean {
    if (ignoreFireTotems.has(state.activeTotems.fire)) {
      return false;
    }
    if (state.activeTotems.fire !== this.name || this.expires < state.time) {
      state.activeTotems.fire = this.name;
      updateFireTotems(state, 2000 + state.time);
      this.expires = state.time + 20000;
      return true;
    }
    let mod = state.cast();
    state.newHit(
      mod * (97 + state.stats.statSpellDamage * 0.1), //todo
      this.name,
      "fire"
    );

    updateFireTotems(state, 2000 + state.time);
    return false;
  }
}
