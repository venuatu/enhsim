<script setup>
import { reactive, ref, watch, watchEffect } from "vue";
import { chain, map } from "lodash";
import { gearById, gearBySlot, populateGear } from "../sim/item";
import { Queue } from "../sim/queue";

let stats = reactive({
  attackPower: 0,
  hitChance: 0,
  critPct: 0,
  meleeHaste: 0,
  armor: 0,
  dps: 0,
  dpsMax: 0,
  dpsMin: 0,
  dpsStd: 0,
  durs: 0,
  runs: 0,
  lastReport: {},
  processing: true,
});

let filters = [
  { name: "mainHand", slots: ["mainHand", "oneHand"] },
  { name: "offHand", slots: ["offHand", "oneHand"] },
  // {name: 'twoHand', slots: ['twoHand']},
  { name: "back", slots: ["back"] },
  { name: "chest", slots: ["chest", "robe"] },
  { name: "feet", slots: ["feet"] },
  { name: "ring1", slots: ["finger"] },
  { name: "ring2", slots: ["finger"] },
  { name: "hands", slots: ["hands"] },
  { name: "head", slots: ["head"] },
  { name: "legs", slots: ["legs"] },
  { name: "neck", slots: ["neck"] },
  // {name: 'ranged', slots: ['ranged']},
  // {name: 'shield', slots: ['shield']},
  { name: "shoulder", slots: ["shoulder"] },
  // {name: 'thrown', slots: ['thrown']},
  { name: "trinket1", slots: ["trinket"] },
  { name: "trinket2", slots: ["trinket"] },
  { name: "waist", slots: ["waist"] },
  { name: "wrists", slots: ["wrists"] },
];

let slots = chain(filters).map().value();
let tab = ref(1);
let data = ref([]);
let dpsRankingsRaw = {};
let selectedDps = ref(0);
if (localStorage.dpsRankings) {
  dpsRankingsRaw = JSON.parse(localStorage.dpsRankings);
}
let dpsRankings = reactive(dpsRankingsRaw);

function getSlotRows(slot) {
  let out = [];
  let slots = filters[slot].slots;
  for (let c of slots) {
    out = out.concat(gearBySlot[c] || []);
  }
  // console.log('tabchange', tab.value-1, data.value.length);
  out = chain(out)
    .sortBy(
      (x) => -(dpsRankings[`${slot + 1}${x.id}`] || 0),
      (x) => -(x.ilvl || 0),
      "name"
    )
    .value();
  return out;
}

let selectedGearRaw = [];
// if (localStorage.selectedGear) {
selectedGearRaw = JSON.parse(localStorage.selectedGear);
// }
let selectedGear = reactive(selectedGearRaw);

function refreshTab() {
  let activeTab = tab.value - 1;
  console.log("tabchange", activeTab);
  data.value = getSlotRows(activeTab);
  let selected = selectedGearRaw[activeTab];
  selectedDps.value = dpsRankings[`${activeTab + 1}${selected}`];
}
watchEffect(refreshTab);

let props = [
  // {prop: 'name', name: 'Name'},
  { prop: "ilvl", name: "i" },
  { prop: "phase", name: "Phase" },
  { prop: "statAgility", name: "Agility" },
  { prop: "statArmorPen", name: "ArPen" },
  { prop: "statAttackPower", name: "Attack Power" },
  { prop: "statCrit", name: "Crit" },
  { prop: "statExpertise", name: "Expertise" },
  { prop: "statHaste", name: "Haste" },
  { prop: "statHit", name: "Hit" },
  { prop: "statStamina", name: "Stamina" },
  { prop: "statStrength", name: "Strength" },
  { prop: "speed", name: "Speed" },
];

function rundps(id) {
  let t = tab.value;
  selectedGear[t - 1] = id;
  selectedGearRaw[t - 1] = id;
  localStorage.selectedGear = JSON.stringify(selectedGearRaw);
  let gear = map(selectedGearRaw.slice(), (i) => gearById[i]);
  dpsRankings[`${t}${id}`] = Infinity;
  tab.value = tab.value;
  return Queue.disperse({
    runs: 10000,
    props: {
      gear: gear,
    },
  }).then(function (reps) {
    let dps = chain(reps).map("dps").mean().value();
    dpsRankings[`${t}${id}`] = dps;
    dpsRankingsRaw[`${t}${id}`] = dps;
    localStorage.dpsRankings = JSON.stringify(dpsRankingsRaw);
    console.log("dpsrank", id, dps);
    tab.value = tab.value;
  });
}

function sheetdps() {
  let selected = selectedGearRaw[tab.value - 1];
  chain(data.value)
    .sortBy((x) => x.ilvl)
    .value()
    .forEach((x) => {
      if (x.id === selected) return;
      rundps(x.id);
    });
  rundps(selected);
  // selectedGearRaw[tab.value-1] = selected;
  // localStorage.selectedGear = JSON.stringify(selectedGearRaw);
}

populateGear().then(() => {
  let defaultGear = [];
  window.defaultGear = defaultGear;
  for (let i = 0; i < filters.length; i++) {
    defaultGear.push(getSlotRows(i)[0].id);
  }
  // console.log('defgear', defaultGear);

  if (selectedGearRaw.length !== filters.length) {
    selectedGearRaw = defaultGear;
  }
  tab.value = tab.value;
  refreshTab();
});
</script>

<template>
  <div>
    <va-tabs v-model="tab">
      <template #tabs>
        <va-tab v-for="(f, i) in filters" :name="i + 1" :key="f.name">
          {{ f.name }}
        </va-tab>
      </template>
    </va-tabs>
    <transition-group name="flip-list" tag="table" class="va-table">
      <tbody>
        <tr key="header">
          <th>Name</th>
          <th v-for="x in props">{{ x.name }}</th>
          <th>DPS</th>
          <th>Δ</th>
        </tr>
        <tr
          v-for="r in data"
          :key="r.id"
          :class="{ selected: selectedGear[tab - 1] === r.id }"
        >
          <td class="name">
            <a :href="'https://tbc.wowhead.com/item=' + r.id" target="_blank">{{
              r.name
            }}</a>
          </td>
          <td v-for="x in props" @click="rundps(r.id)">{{ r[x.prop] }}</td>
          <td class="dps" @click="rundps(r.id)">
            {{ (dpsRankings[`${tab}${r.id}`] || 0).toFixed(0) }}
          </td>
          <td>
            {{ ((dpsRankings[`${tab}${r.id}`] || 0) - selectedDps).toFixed(2) }}
          </td>
        </tr>
      </tbody>
    </transition-group>
    <va-button @click="sheetdps()">Sheet DPS</va-button>
    <!-- <va-alert></va-alert> -->
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
}
.card,
.cen {
  padding: 0.25rem;
}
.name,
.name a:link,
.name a:visited,
.dps {
  font-weight: bold;
  color: rgb(204, 204, 204);
}
.selected,
.selected > td {
  background-color: rgba(167, 247, 47, 0.1);
}
tr {
  min-width: 100%;
}
th {
  color: white !important;
}
td {
  cursor: grab;
}
td a {
  cursor: pointer;
}
tr:hover {
  background-color: rgba(0, 255, 255, 0.1);
}
table {
  width: 100%;
}
.flip-list-move {
  transition: transform 0.8s ease;
}
</style>
