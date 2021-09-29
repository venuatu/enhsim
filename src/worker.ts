import { forEach } from "lodash";
import State from "./sim/state";

class WorkerState {
  id: string;
  active: boolean = false;

  start(id: string) {
    this.id = id;
    console.log("worker", id, "active");
  }

  newtask(data: any) {
    clearTimeout(tick);
    console.log("worker task", this.id, data.runs, data.props);
    this.active = true;
    try {
      let reps = [];
      for (let i = 0; i < data.runs; i++) {
        let state = new State();
        forEach(data.props, (v, k) => {
          if (Array.isArray(state[k])) {
            state[k] = state[k].concat(v);
          }
        });
        if (data.props.gear) {
          state.gear = data.props.gear;
        }
        state.run();
        reps.push(state.report());
      }
      postMessage({
        type: "response",
        data: reps,
        time: Date.now(),
      });
    } catch (e) {
      console.error("workererr", e);
      postMessage({
        type: "error",
        data: "" + e,
        time: Date.now(),
      });
    }
    tick = setTimeout(requestor, 20);
    this.active = false;
  }

  onMessage(msg) {
    if (!!this[msg.type]) {
      this[msg.type](msg.data);
    } else {
      console.log("worker unkmsg", msg.type, msg.data);
    }
  }
}
let work = new WorkerState();
onmessage = function (msg) {
  work.onMessage(msg.data);
};

let tick;
function requestor() {
  if (!work.active) {
    postMessage({
      type: "request",
      time: Date.now(),
    });
    // console.log('worker requesting', work.id);
  }
  tick = setTimeout(requestor, 1000);
}
requestor();
