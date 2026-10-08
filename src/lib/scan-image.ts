// Pick a scan photo (camera or gallery) and return it as a small base64 data URL,
// ready to send to analyzeImage().
//
// IMPORTANT (Android crash fix): full-resolution photos produce multi-MB base64
// strings that crash Android when passed over the bridge / rendered. We pick
// the photo WITHOUT base64, downscale it to max 1024px wide with
// expo-image-manipulator, and only then take base64 of the small image.
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export async function pickScanImage(fromCamera: boolean): Promise<string | null> {
  const perm = fromCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Permission denied — allow access to continue.');

  // NOTE: allowsEditing crop UI is unreliable on many Android devices
  // (it silently cancels the pick), so we skip it for cross-platform reliability.
  const res = fromCamera
    ? await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: false,
      })
    : await ImagePicker.launchImageLibraryAsync({
        quality: 1,
        allowsEditing: false,
      });

  if (res.canceled || !res.assets || res.assets.length === 0) return null;
  const a = res.assets[0];
  if (!a.uri) return null;

  // Downscale before base64 — keeps the data URL small (~100-200KB).
  const small = await manipulateAsync(
    a.uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.7, format: SaveFormat.JPEG, base64: true }
  );
  if (!small.base64) return null;
  return `data:image/jpeg;base64,${small.base64}`;
}
