import Action from "../action";
import State from "../state";
import { isWorker } from "../utils";
import WeaponMain, { decrementFlurry } from "./weaponmain";

export default class WeaponOff extends WeaponMain {
  name = "offhand";
  nextTick = 1;
  prevSwing = 0;
  needsGCD = false;
  calculateSwing(state: State) {
    let wep = state.weapons[1];
    return (
      (wep.dmgMin +
        (wep.dmgMax - wep.dmgMin) * Math.random() +
        state.stats.statAttackPower / 14) /
      2
    );
  }

  run(state: State): boolean {
    if (state.weapons.length < 2) {
      return false;
    }

    let mod = state.swing(true);
    state.newHit(mod * this.calculateSwing(state), this.name, "physical");
    let speed = state.weapons[1].speed / (1 + state.stats.statHaste);
    this.nextTick = speed + state.time;
    this.prevSwing = state.time;
    decrementFlurry(state);

    let mainhand = state.actMap["mainhand"] as WeaponMain;

    let swingtimer = Math.min(
      // Math.abs(state.time - mainhand.prevSwing),
      this.nextTick - mainhand.nextTick
    );
    // if (!isWorker) console.log('swing oh', state.time /1000, speed, swingtimer);
    if (swingtimer < 0) {
      // if (!isWorker) console.log('delay oh', swingtimer, state.time / 1000)
      state.annoyance.ohDelay += 1;
      this.nextTick = this.nextTick - swingtimer;
    } else if (swingtimer > 500) {
      // if (!isWorker) console.log('delay oh long', swingtimer, state.time / 1000)
      this.nextTick =
        mainhand.nextTick + (mainhand.nextTick - mainhand.prevSwing) + 1;
      // mainhand.ohDelayed = state.time;
      state.annoyance.ohDelay += 1;
    }
    return true;
  }
}
