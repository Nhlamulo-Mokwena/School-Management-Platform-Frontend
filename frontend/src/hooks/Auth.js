// ─── JWT Utility ────────────────────────────────────────────────
// A JWT has three parts separated by dots: header.payload.signature
// The payload is Base64-encoded JSON containing the user's claims.
// We decode it on the client to read the role — no API call needed.

// Decodes the JWT payload and returns it as a plain object.
// Returns null if the token is missing or malformed.
export function decodeToken(token) {
  if (!token) return null
  try {
    // Split on "." and take the middle part (index 1) — that's the payload.
    // atob() decodes Base64 back to a JSON string, then we parse it.
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

// Reads the token from localStorage and returns the decoded payload.
// Use this anywhere you need to know who is logged in.
export function getCurrentUser() {
  const token = localStorage.getItem('token')
  return decodeToken(token)
}

// Returns the user's role string e.g. "ROLE_ADMIN", "ROLE_PARENT".
// Returns null if not logged in.
export function getUserRole() {
  const token = localStorage.getItem('token'); // or wherever you store it
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // If roles is an array, find the one that starts with ROLE_
    if (Array.isArray(payload.roles)) {
      return payload.roles.find(r => r.startsWith('ROLE_')) || null;
    }
    
    return payload.roles || null;
  } catch (e) {
    return null;
  }
}

// Checks if there is a valid (non-expired) token in localStorage.
export function isLoggedIn() {
  const user = getCurrentUser()
  if (!user) return false
  // JWT "exp" is a Unix timestamp in seconds — compare to current time
  return user.exp * 1000 > Date.now()
}

// Removes the token — call this on logout.
export function logout() {
  localStorage.removeItem('token')
}