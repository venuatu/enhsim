import Action from "../action";
import { Flurry } from "../buff";
import State from "../state";

export function decrementFlurry(state: State) {
  for (let b of state.buffs) {
    if (b.name == Flurry.name) {
      if (state.time - b.lastFlurry < 500) return;
      b.stacks -= 1;
      b.lastFlurry = state.time;
      if (b.stacks <= 0) {
        b.expires = state.time;
      }
      break;
    }
  }
}

export default class WeaponMain implements Action {
  name = "mainhand";
  nextTick = 0;
  needsGCD = false;
  prevSwing = 0;
  ohDelayed = null;

  calculateSwing(state: State) {
    let wep = state.weapons[0];
    return (
      wep.dmgMin +
      (wep.dmgMax - wep.dmgMin) * Math.random() +
      state.stats.statAttackPower / 14
    );
  }

  run(state: State): boolean {
    let mod = state.swing(true);
    state.newHit(mod * this.calculateSwing(state), this.name, "physical");
    let speed = state.weapons[0].speed / (1 + state.stats.statHaste);
    // if (!isWorker) console.log('mh', speed);
    this.nextTick = speed + state.time;
    this.prevSwing = state.time;
    // if (!isWorker) console.log('swing mh', state.time /1000, speed);
    decrementFlurry(state);
    if (this.ohDelayed) {
      // if (!isWorker) console.log('push oh', speed, (state.time - this.ohDelayed) / 1000, state.time / 1000);
      // state.actMap['offhand'].run(state);
      state.actMap["offhand"].nextTick = state.time + 1;
      this.ohDelayed = null;
    }
    return true;
  }
}
