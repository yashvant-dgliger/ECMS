import { apiRequest } from '../../services/api/client';

export async function loginWithFirebase(firebaseIdToken: string) {
  return apiRequest('/auth/firebase-login', {
    method: 'POST',
    body: JSON.stringify({ firebaseIdToken, deviceId: 'mobile-device' })
  });
}
