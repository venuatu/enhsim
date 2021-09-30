<script setup>
import { reactive, watch } from "vue";
import { gearById, populateGear } from "../sim/item";

let stats = reactive({
  dps: 0,
  dpsMax: 0,
  dpsMin: 0,
  dpsStd: 0,
  duration: 0,
  runs: 0,
  lastReport: "",
  gemReport: null,
  processing: true,
});

let runs = 50000;
// const ostats = state.stats;

import { chain, map, partial, isNumber } from "lodash";
import { AllGems } from "../sim/gems";
import { Queue } from "../sim/queue";

function getGear() {
  let gear = JSON.parse(
    localStorage.selectedGear ||
      "[28767,27872,29994,30185,30039,29997,30052,30189,30190,30192,30017,30055,29383,29383,30106,30091]"
  );
  return map(gear, (v) => gearById[v]);
}

function dps(runs) {
  stats.processing = true;
  Queue.disperse({
    runs: runs,
    props: {
      gear: getGear(),
    },
  }).then(function (reps) {
    stats.processing = false;
    window.reps = reps;
  });
}

let gems = [];
let statReport = {};
function statValues(runs) {
  runs = runs || 50000;
  statReport = {};
  let proms = [];
  for (let gem of AllGems) {
    let N = 1;
    let push = chain()
      .range(N)
      .map(() => gem)
      .value();
    let p = Queue.disperse({
      runs: runs,
      props: {
        gear: getGear(),
        buffs: push,
      },
    });
    proms.push(p);
    p.then(function (reps) {
      let dps = chain(reps).map("dps").mean().value();
      statReport[gem.name] = (dps - stats.dps) / N;
      stats.gemReport = chain(statReport)
        .map((v, k) => ({ n: k, v: v }))
        .sortBy("v")
        .reverse()
        .map((v) => `${v.n}: ${v.v.toFixed(2)}`)
        .join("\n")
        .value();
      console.log(gem.name, statReport[gem.name], dps);
    });
  }
  Promise.all(proms).then(function () {
    stats.processing = false;
  });
  statReport = {};
  stats.processing = true;
}

let visibleProps = new Set([
  "dps",
  "dpsMax",
  "dpsMin",
  "dpsStd",
  "duration",
  "durationMin",
  "durationMax",
  "runs",
  "dpsCurve",
  "durationCurve",
]);

function formatNumber(v) {
  if (Math.ceil(v) === v) {
    return v;
  } else {
    return v.toFixed(4);
  }
}

watch(Queue.lastReport, () => {
  const stringCol = function (indent, v, k) {
    if (visibleProps.has(k)) return "";
    let ind = "";
    for (let i = 0; i < indent; i++) ind += "    ";
    let ov;
    if (isNumber(v)) {
      ov = formatNumber(v);
    } else {
      ov =
        "\n" +
        chain(v)
          .map(partial(stringCol, indent + 1))
          .sort()
          .join("\n")
          .value();
    }
    return ind + k + ": " + ov;
  };
  stats.lastReport = chain(Queue.lastReport.value)
    .map(partial(stringCol, 0))
    .filter()
    .sort()
    .join("\n")
    .value();

  for (let k of visibleProps) {
    stats[k] = Queue.lastReport.value[k];
    if (isNumber(stats[k])) stats[k] = stats[k].toFixed(2);
  }
});

populateGear().then((x) => {
  dps(1000);
});

import GearPage from "./GearPage.vue";
</script>

<template>
  <div class="row" id="window">
    <div class="" id="leftsidebar">
      <p class="loading" v-if="stats.processing || Queue.processing.value">
        <va-icon name="loop" spin size="50" />
      </p>
      <va-alert
        >DPS: {{ stats.dps }} σ {{ stats.dpsStd }} ({{ stats.dpsMin }}-{{
          stats.dpsMax
        }})</va-alert
      >
      <svg class="dpschart" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect
          v-for="(x, i) in stats.dpsCurve"
          :key="i"
          fill="rgb(204, 204, 204)"
          :width="100 / stats.dpsCurve.length - 0.2"
          :height="x * 100"
          :y="(1 - x) * 100"
          :x="i * (100 / stats.dpsCurve.length)"
        />
      </svg>
      <va-alert>Runs: {{ stats.runs }} @ {{ stats.duration }}ms</va-alert>
      <va-alert>
        <pre>{{ stats.lastReport }}</pre>
      </va-alert>
      <va-alert v-if="stats.gemReport">
        <pre>{{ stats.gemReport }}</pre>
      </va-alert>
      <p class="flex cen"><va-button @click="dps(runs)">DPS</va-button></p>
      <p class="flex cen">
        <va-button @click="statValues()">Gem Weights</va-button>
      </p>
      <p class="flex cen">
        <va-button @click="settings()">Settings</va-button>
      </p>
    </div>
    <GearPage class="flex" id="rightcontent"></GearPage>
  </div>
</template>

<style scoped>
a {
  color: #42b983;
}
va-card {
  padding: 0.75rem;
}
.cen {
  text-align: center;
  padding: 0.25rem;
}
.loading {
  background-color: black;
  text-align: center;
}
.loading i {
  font-size: 48px;
}
#leftsidebar {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  width: 20%;
  width: max(20em, 20%);
  height: 100%;
  overflow-y: auto;
  border-right: 0.1rem solid black;
}
#rightcontent {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  height: 100%;
  width: 20%;
  width: min(calc(100% - 20em), 80%);
}
* {
  word-wrap: break-word;
}
.dpschart {
  width: 100%;
  height: 5rem;
  /* height: 3rem; */
}
pre {
  width: 20em;
  word-wrap: break-word;
  font-size: 10pt;
  overflow: hidden;
}
</style>
