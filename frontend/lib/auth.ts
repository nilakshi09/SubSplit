export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('spotbot_token')
  }
  return null
}

export function setAccessToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('spotbot_token', token)
  }
}

export function removeAccessToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('spotbot_token')
  }
}
