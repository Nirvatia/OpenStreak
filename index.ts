import { registerRootComponent } from 'expo';

import App from './App';
// Фоновая задача геозон должна быть объявлена при старте, до создания интерфейса.
import './src/services/geofence';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
