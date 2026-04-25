import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStorage = new Map();
let hasWarnedAboutFallback = false;

function warnStorageFallback(error) {
  if (hasWarnedAboutFallback) return;

  hasWarnedAboutFallback = true;
  console.warn(
    '[storage] AsyncStorage indisponível; usando fallback em memória.',
    error
  );
}

export async function getStoredValue(key) {
  const memoryValue = memoryStorage.has(key) ? memoryStorage.get(key) : null;

  try {
    const value = await AsyncStorage.getItem(key);
    return value ?? memoryValue;
  } catch (error) {
    warnStorageFallback(error);
    return memoryValue;
  }
}

export async function setStoredValue(key, value) {
  memoryStorage.set(key, value);

  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error) {
    warnStorageFallback(error);
    return false;
  }
}
