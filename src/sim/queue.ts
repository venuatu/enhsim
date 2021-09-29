import { cloneDeep, flatten } from "lodash";
import { ref } from "vue";
import Worker from "../worker?worker";

const WORKER_LOCATION = "src/worker.ts";

class Request {
  runs: number = 1000;
  props: Record<string, object>;
}

class WorkerWID extends Worker {
  _id: string;
}

interface WMessage {
  time: number;
  type: string;
  data: any;
}

class TaskQueue {
  workers: Array<WorkerWID> = [];
  queue: Array<object> = [];
  active: boolean = false;
  activeTasks: Record<string, object> = {};

  cores: number = navigator.hardwareConcurrency;
  lastReport: any = ref({});

  push(e: Request) {
    if (!this.active) {
      this.active = true;
      while (this.workers.length < this.cores) {
        let w = new Worker(WORKER_LOCATION, { type: "module" }) as WorkerWID;
        w._id = "" + this.workers.length;
        w.onmessage = (m) => this.workerMessage(w, m.data);
        w.postMessage({
          type: "start",
          data: w._id,
          time: Date.now(),
        });
        this.workers.push(w);
      }
    }
    return new Promise((resolve, reject) => {
      this.queue.push([e, resolve, reject]);
    });
  }

  disperse(e: Request) {
    let splits = Math.ceil(e.runs / this.cores);
    let proms = [];
    for (let i = 0; i < this.cores; i++) {
      proms.push(
        this.push({
          runs: splits,
          props: cloneDeep(e.props),
        })
      );
    }
    return Promise.all(proms).then((r) => {
      return flatten(r);
    });
  }

  workerMessage(worker: WorkerWID, message: WMessage) {
    let now = Date.now();
    if (message.type === "request") {
      if (this.activeTasks[worker._id]) {
        if (now - message.time > 5) {
          console.log("worker reqold", now - message.time);
          return;
        }
        this.activeTasks[worker._id][2](new Error("lost task"));
      }
      if (!this.queue.length) {
        return;
      }
      let msg = this.queue.pop();
      this.activeTasks[worker._id] = msg;
      worker.postMessage({
        type: "newtask",
        data: msg[0],
      });
    } else if (message.type === "response") {
      this.activeTasks[worker._id][1](message.data);
      delete this.activeTasks[worker._id];
      this.lastReport.value = message.data[0];
    } else if (message.type === "error") {
      this.activeTasks[worker._id][2](message.data);
      delete this.activeTasks[worker._id];
    }
  }
}
export const Queue = new TaskQueue();
