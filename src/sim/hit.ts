export enum Schools {
  physical = "physical",
  arcane = "arcane",
  fire = "fire",
  frost = "frost",
  nature = "nature",
  shadow = "shadow",
  holy = "holy",
}

export default class Hit {
  amount: number;
  time: number;
  from: string;
  type: Schools;
}
