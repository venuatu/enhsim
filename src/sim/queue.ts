import {
  chain,
  cloneDeep,
  flatten,
  forEach,
  isNumber,
  keys,
  max,
  mean,
  min,
  sortBy,
  takeRight,
  times,
} from "lodash";
import { ref } from "vue";
//@ts-ignore
import Worker from "../worker?worker";
import { histogram, percentile, standardDeviation } from "./utils";

const WORKER_LOCATION = "src/worker.ts";

class FullRequest {
  runs: number = 1000;
  props: Record<string, object>;
  flags: any;
}
type Request = Partial<FullRequest>;

interface WMessage {
  time: number;
  type: string;
  data: any;
}

class TaskQueue {
  workers: Array<Worker> = [];
  queue: Array<object> = [];
  active: boolean = false;
  processing = ref(false);
  activeTasks: Record<string, object> = {};

  cores: number = navigator.hardwareConcurrency * 0.75;
  lastReport: any = ref({});
  flags: any;

  ensureWorkers() {
    this.flags = JSON.parse(localStorage.enhsimFlags);
    if (!this.active) {
      this.active = true;
      while (this.workers.length < this.cores) {
        let w = new Worker(WORKER_LOCATION, { type: "module" }) as Worker;
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
  }

  push(e: Request) {
    this.ensureWorkers();
    e.flags = this.flags;
    this.processing.value = true;
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
      // this.publishReport(message.data);
      let reps = flatten(r);
      this.publishReport(reps, chain(reps).map("duration").sum().value());
      return reps;
    });
  }

  workerMessage(worker: Worker, message: WMessage) {
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
        this.processing.value = false;
        return;
      }
      let msg = this.queue.pop();
      this.activeTasks[worker._id] = msg;
      worker.lastSent = Date.now();
      worker.postMessage({
        type: "newtask",
        data: msg[0],
      });
    } else if (message.type === "response") {
      this.activeTasks[worker._id][1](message.data);
      delete this.activeTasks[worker._id];
      this.publishReport(message.data, Date.now() - worker.lastSent);
    } else if (message.type === "error") {
      this.activeTasks[worker._id][2](message.data);
      delete this.activeTasks[worker._id];
    }
  }
  etas: Array<number> = [];

  mergeReports(reps: Array<any>): any {
    let ret = {
      runs: reps.length,
    };
    for (let x of reps) {
      for (let k of keys(x)) {
        let v = x[k];
        if (isNumber(v)) {
          if (!ret[k]) ret[k] = [];
          ret[k].push(v);
        } else {
          if (!ret[k]) ret[k] = {};
          for (let j of keys(v)) {
            if (!ret[k][j]) ret[k][j] = [];
            ret[k][j].push(v[j]);
          }
        }
      }
    }
    forEach(ret, function mergeReports(v, k) {
      if (Array.isArray(v)) {
        ret[k + "Max"] = max(v);
        ret[k + "Min"] = min(v);
        ret[k + "Curve"] = histogram(v);
        // ret[k + "Mean"] = mean(v);
        // ret[k] = percentile(v, 0.5);
        ret[k] = mean(v);
      } else {
        for (let j of keys(ret[k])) ret[k][j] = mean(ret[k][j]);
      }
    });
    return ret;
  }

  publishReport(reps: Array<any>, dur: number) {
    let rep = this.mergeReports(reps);

    let remruns = chain(this.queue)
      .map((m) => m[0].runs)
      .sum()
      .value();
    let avg = dur / reps.length;
    this.etas.push((remruns * avg) / this.cores / 1000);
    this.etas = takeRight(this.etas, this.cores * 8);
    rep.etaSeconds = chain(this.etas).mean().value();
    this.lastReport.value = rep;
  }
}
export const Queue = new TaskQueue();
