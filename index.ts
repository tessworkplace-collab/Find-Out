import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import WebApp from './App';
import NativeRoot from './NativeRoot';

registerRootComponent(Platform.OS === 'web' ? WebApp : NativeRoot);
