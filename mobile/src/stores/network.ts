import { defineStore } from 'pinia';
import { Network } from '@capacitor/network';

export const useNetworkStore = defineStore('network', {
    state: () => ({
        status: {
            connected: true,
            connectionType: 'unknown',
        },
    }),

    actions: {
        async initListener() {
            const status = await Network.getStatus();
            this.status = status;

            Network.addListener('networkStatusChange', (status) => {
                this.status = status;
            });
        },
    },
});
