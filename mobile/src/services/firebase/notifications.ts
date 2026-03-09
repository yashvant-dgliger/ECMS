export async function registerDeviceToken(token: string) {
  return fetch('http://localhost:3000/v1/devices/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, platform: 'mobile' })
  });
}
