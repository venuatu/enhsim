import Action from "../action";
import State from "../state";
import SearingTotem, {
  ignoreFireTotems,
  updateFireTotems,
} from "./searingtotem";

export default class FireNovaTotem implements Action {
  name = "totemfirenova";
  nextTick = 0;
  needsGCD = true;
  cooldown = 0;

  run(state: State): boolean {
    if (this.cooldown <= state.time && state.activeTotems.fire !== this.name) {
      if (state.activeTotems.fire) {
        let st = state.actMap[state.activeTotems.fire] as SearingTotem;
        st.expires = state.time;
      }

      state.activeTotems.fire = this.name;
      updateFireTotems(state, 4000 + state.time);
      this.cooldown = state.time + 15000;
      return true;
    }
    let mod = state.cast();
    state.newHit(
      mod * (654 + 76 * Math.random() + state.stats.statSpellDamage * 0.2142), //todo
      this.name,
      "fire"
    );
    state.activeTotems.fire = null;
    updateFireTotems(state, 1 + state.time);
    return false;
  }
}
