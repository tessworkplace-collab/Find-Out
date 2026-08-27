import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import WebApp from './App';
import NativeStartup from './NativeStartup';

registerRootComponent(Platform.OS === 'web' ? WebApp : NativeStartup);
