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

// Queue.push({runs: 1, props: {}}).then(function (r) {
//     console.log('report q', r);
// })
