import { max, sortBy } from "lodash";

export const isWorker: boolean = //@ts-ignore
  typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;

// https://github.com/30-seconds/30-seconds-of-code/blob/master/snippets/standardDeviation.md
export function standardDeviation(
  arr: Array<number>,
  usePopulation: boolean = false
): number {
  const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
  return Math.sqrt(
    arr
      .reduce((acc, val) => acc.concat((val - mean) ** 2), [])
      .reduce((acc, val) => acc + val, 0) /
      (arr.length - (usePopulation ? 0 : 1))
  );
}

export function histogram(
  arr: Array<number>,
  buckets: number = 0
): Array<number> {
  if (!buckets) {
    // try to get buckets 4px wide
    buckets = Math.floor((window.innerWidth * 0.2) / 4);
  }
  arr = sortBy(arr);
  let min = arr[0];
  let range = arr[arr.length - 1] - min;
  let mod = range / buckets;
  let out = new Array(buckets);
  for (let i = 0; i < buckets; i++) out[i] = 0;

  for (let n of arr) {
    let buck = Math.floor((n - min) / mod);
    out[buck] += 1;
  }

  let mx = max(out);
  return out.map((x) => x / mx);
}

//https://gist.github.com/IceCreamYou/6ffa1b18c4c8f6aeaad2
export function percentile(arr: Array<number>, p: number): number {
  if (arr.length === 0) return 0;
  if (p <= 0) return arr[0];
  if (p >= 1) return arr[arr.length - 1];

  var index = (arr.length - 1) * p,
    lower = Math.floor(index),
    upper = lower + 1,
    weight = index % 1;

  if (upper >= arr.length) return arr[lower];
  return arr[lower] * (1 - weight) + arr[upper] * weight;
}

export const setBonuses = [
  {
    id: 633,
    items: [29038, 29039, 29040, 29043, 29042],
    name: "Cyclone Harness",
    spells: [
      { min: 2, statStrength: 12 },
      { min: 4, stormstrikeT4Bonus: 1 },
    ],
  },
  {
    id: 636,
    items: [30185, 30189, 30190, 30192, 30194],
    name: "Cataclysm Harness",
    spells: [{ min: 4, statHaste: 78.8 }],
  },
  {
    id: 682,
    items: [31018, 31011, 31015, 31021, 31024, 34567, 34439, 34545],
    name: "Skyshatter Harness",
    spells: [{ min: 4, statAttackPower: 70 }],
  },
  {
    id: 619,
    items: [29527, 29526, 29525],
    name: "Primal Intent",
    spells: [{ min: 3, statAttackPower: 40 }],
  },
  {
    id: 617,
    items: [29521, 29520, 29519],
    name: "Netherstrike Armor",
    spells: [{ min: 3, statSpellDamage: 23, statSpellHealing: 23 }],
  },
  {
    id: 616,
    items: [29516, 29517, 29515],
    name: "Netherscale Armor",
    spells: [{ min: 3, statHit: 20 }],
  },
];
