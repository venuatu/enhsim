import Action from "../action";
import State from "../state";
import WeaponMain from "./weaponmain";
import WeaponOff from "./weaponoff";

export default class StormStrike implements Action {
  name = "stormstrike";
  nextTick = 0;
  needsGCD = true;
  // mh: WeaponMain;
  // oh: WeaponOff;

  run(state: State): boolean {
    state.newHit(
      state.swing() *
        (state.actMap["mainhand"] as WeaponMain).calculateSwing(state),
      this.name,
      "physical"
    );
    state.newHit(
      state.swing() *
        (state.actMap["offhand"] as WeaponOff).calculateSwing(state),
      this.name,
      "physical"
    );
    this.nextTick = 12000 + state.time;
    return true;
  }
}
