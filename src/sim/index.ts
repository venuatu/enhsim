import State from "./state";

export class Simulator {
  state: State;

  run() {
    this.state = new State();
    while (this.state.tick()) {}
  }
}
