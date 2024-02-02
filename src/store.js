import { configureStore } from '@reduxjs/toolkit';

import { itemsReducer } from './features/items/index.js';
import { bartersReducer } from './features/barters/index.js';
import { questsReducer } from './features/quests/index.js';
import { tradersReducer } from './features/traders/index.js';
import { bossesReducer } from './features/bosses/index.js';
import { mapsReducer } from './features/maps/index.js';
import socketsReducer from './features/sockets/socketsSlice.js';
import settingsReducer from './features/settings/settingsSlice.js';

export default configureStore({
    reducer: {
        items: itemsReducer,
        barters: bartersReducer,
        quests: questsReducer,
        traders: tradersReducer,
        bosses: bossesReducer,
        maps: mapsReducer,
        sockets: socketsReducer,
        settings: settingsReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
    }),
});
