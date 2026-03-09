export class AuthService {
  async firebaseLogin(firebaseIdToken: string) {
    if (!firebaseIdToken) throw new Error('FIREBASE_TOKEN_REQUIRED');
    return {
      accessToken: `ecms_access_${Date.now()}`,
      refreshToken: `ecms_refresh_${Date.now()}`,
      expiresIn: 900
    };
  }
}
