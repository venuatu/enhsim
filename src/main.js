import "./warmstorage";

import { createApp } from "vue";
import { VuesticPlugin } from "vuestic-ui";
import "vuestic-ui/dist/vuestic-ui.css";
import App from "./App.vue";

const app = createApp(App);
app.use(VuesticPlugin, {
  colors: {
    // Default colors
    primary: "#001e1d",
    secondary: "#abd1c6",
    //   success: '#fffffe',
    info: "#ff8906",
    danger: "#e34b4a",
    warning: "#ffc200",
    gray: "#babfc2",
    dark: "#34495e",
    background: "#004643",
  },
});
app.mount("#app");

import State from "./sim/state";
window.State = State;
