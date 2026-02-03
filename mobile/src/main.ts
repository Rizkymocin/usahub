import { createApp } from 'vue';
import Framework7 from 'framework7/lite-bundle';
import Framework7Vue, { registerComponents } from 'framework7-vue/bundle';
import { createPinia } from 'pinia';
import App from './App.vue';
// import router from './router'; // Framework7 handles routing internally



// Import F7 Bundle
import 'framework7/css/bundle';
// Import Icons
import 'framework7-icons/css/framework7-icons.css';
import 'material-icons/iconfont/material-icons.css';

// Init F7-Vue
Framework7.use(Framework7Vue);

const app = createApp(App);
const pinia = createPinia();

// Register F7 Components
registerComponents(app);

app.use(pinia);
app.use(pinia);
// app.use(router); // Framework7 handles routing internally via App.vue params


app.mount('#app');
