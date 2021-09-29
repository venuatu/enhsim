import State from "./state";

export default interface Action {
  name: string;
  nextTick: Number;
  needsGCD: boolean;

  run(state: State): boolean;
}
