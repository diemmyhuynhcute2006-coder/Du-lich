/**
 * Local Account Authentication & Session Service
 * Powered by Web Crypto API (SHA-256) and localStorage
 */

export interface LocalUserAccount {
  id: string;
  username: string; // lowercase unique identifier
  displayName: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserSession {
  uid: string;
  username: string;
  displayName: string;
  createdAt: string;
}

const ACCOUNTS_STORAGE_KEY = 'journey_app_accounts_v1';
const CURRENT_SESSION_KEY = 'journey_app_current_session_v1';

/**
 * Hash password securely using native browser Web Crypto API (SHA-256 + Salt)
 * Never store plaintext passwords!
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}:journey_local_auth_2026_pepper`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a random cryptographic salt
 */
export function generateSalt(): string {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Retrieve all registered accounts from localStorage
 */
export function getRegisteredAccounts(): LocalUserAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse registered accounts:', error);
    return [];
  }
}

/**
 * Save registered accounts to localStorage
 */
function saveRegisteredAccounts(accounts: LocalUserAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error('Failed to save registered accounts:', error);
  }
}

/**
 * Validate that username strictly conforms to 3-20 alphanumeric characters or underscore, no spaces, no diacritics
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  const trimmed = username.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Vui lòng nhập tên tài khoản' };
  }
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { isValid: false, error: 'Tên tài khoản phải dài từ 3 đến 20 ký tự' };
  }
  // Regex: English letters a-z, A-Z, numbers 0-9, and underscore _
  const validPattern = /^[a-zA-Z0-9_]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      isValid: false,
      error: 'Tên tài khoản chỉ được chứa chữ cái tiếng Anh (không dấu), số và dấu gạch dưới (_)',
    };
  }
  return { isValid: true };
}

/**
 * Check if a username is already taken
 */
export function isUsernameTaken(username: string): boolean {
  const clean = username.trim().toLowerCase();
  const accounts = getRegisteredAccounts();
  return accounts.some((acc) => acc.username.toLowerCase() === clean);
}

/**
 * Register a new user account with hashed password
 */
export async function registerLocalAccount(
  username: string,
  plaintextPassword: string,
  displayName?: string
): Promise<UserSession> {
  const validation = validateUsername(username);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Tên tài khoản không hợp lệ');
  }

  if (!plaintextPassword || plaintextPassword.length < 6) {
    throw new Error('Mật khẩu phải có tối thiểu 6 ký tự');
  }

  const cleanUsername = username.trim().toLowerCase();
  if (isUsernameTaken(cleanUsername)) {
    throw new Error('Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác.');
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(plaintextPassword, salt);
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const cleanDisplayName = displayName?.trim() || cleanUsername;
  const now = new Date().toISOString();

  const newAccount: LocalUserAccount = {
    id: userId,
    username: cleanUsername,
    displayName: cleanDisplayName,
    passwordHash,
    salt,
    createdAt: now,
    lastLoginAt: now,
  };

  const accounts = getRegisteredAccounts();
  accounts.push(newAccount);
  saveRegisteredAccounts(accounts);

  const session: UserSession = {
    uid: userId,
    username: cleanUsername,
    displayName: cleanDisplayName,
    createdAt: now,
  };

  saveCurrentSession(session);
  return session;
}

/**
 * Login with username and password
 */
export async function loginLocalAccount(
  username: string,
  plaintextPassword: string
): Promise<UserSession> {
  const cleanUsername = username.trim().toLowerCase();
  const accounts = getRegisteredAccounts();
  const account = accounts.find((acc) => acc.username.toLowerCase() === cleanUsername);

  if (!account) {
    throw new Error('Tên tài khoản không tồn tại. Vui lòng kiểm tra lại hoặc chuyển sang tab Đăng ký.');
  }

  const computedHash = await hashPassword(plaintextPassword, account.salt);
  if (computedHash !== account.passwordHash) {
    throw new Error('Mật khẩu không chính xác. Vui lòng thử lại.');
  }

  // Update last login
  account.lastLoginAt = new Date().toISOString();
  saveRegisteredAccounts(accounts);

  const session: UserSession = {
    uid: account.id,
    username: account.username,
    displayName: account.displayName || account.username,
    createdAt: account.createdAt,
  };

  saveCurrentSession(session);
  return session;
}

/**
 * Save active session
 */
export function saveCurrentSession(session: UserSession | null): void {
  try {
    if (session) {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  } catch (error) {
    console.error('Failed to save current session:', error);
  }
}

/**
 * Load active session on page reload
 */
export function getCurrentSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(CURRENT_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to get current session:', error);
    return null;
  }
}

/**
 * Logout
 */
export function clearCurrentSession(): void {
  try {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear current session:', error);
  }
}
