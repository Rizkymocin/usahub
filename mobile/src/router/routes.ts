import HomePage from '../pages/HomePage.vue';
import LoginPage from '../pages/LoginPage.vue';
import TopupPage from '../pages/TopupPage.vue';
import ActivityPage from '../pages/ActivityPage.vue';
import AccountPage from '../pages/AccountPage.vue';

const routes = [
    {
        path: '/',
        component: HomePage,
    },
    {
        path: '/login',
        component: LoginPage,
    },
    {
        path: '/topup',
        component: TopupPage,
    },
    {
        path: '/activity',
        component: ActivityPage,
    },
    {
        path: '/account',
        component: AccountPage,
    },
];

export default routes;
