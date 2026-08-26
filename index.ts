import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import WebApp from './App';
import NativeApp from './NativeApp';

registerRootComponent(Platform.OS === 'web' ? WebApp : NativeApp);
