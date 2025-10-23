// Cloudflare Worker API base URL
const API_BASE_URL = 'https://pyusd-contacts-api.dawid-pisarczyk.workers.dev';

export interface UserProfile {
  id?: number;
  wallet_address: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: number;
  updated_at?: number;
}

export interface RecentSend {
  to_wallet_address: string;
  last_sent_at: number;
  username?: string;
  display_name?: string;
  avatar_url?: string;
}

/**
 * Create or update user profile
 */
export async function saveProfile(profile: UserProfile): Promise<{ success: boolean }> {
  try {
    console.log('Saving profile:', profile);
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to save profile: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Save profile result:', result);
    return result;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
}

/**
 * Get user profile by wallet address or username
 */
export async function getProfile(identifier: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${identifier.toLowerCase()}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data = await response.json();
    return data.profile || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

/**
 * Search for users by username or display name
 */
export async function searchUsers(query: string): Promise<UserProfile[]> {
  try {
    if (query.length < 2) {
      return [];
    }

    const response = await fetch(
      `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to search users: ${response.statusText}`);
    }

    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

/**
 * Check if a username is available
 */
export async function checkUsernameAvailability(username: string): Promise<{
  available: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/check-username/${username.toLowerCase()}`);

    if (!response.ok) {
      throw new Error(`Failed to check username: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking username:', error);
    throw error;
  }
}

/**
 * Get recent sends for a user
 */
export async function getRecentSends(walletAddress: string): Promise<RecentSend[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/recent/${walletAddress.toLowerCase()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch recent sends: ${response.statusText}`);
    }

    const data = await response.json();
    return data.recent || [];
  } catch (error) {
    console.error('Error fetching recent sends:', error);
    throw error;
  }
}

/**
 * Track a recent send (for recent recipients list)
 */
export async function trackRecentSend(
  fromWalletAddress: string,
  toWalletAddress: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/recent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_wallet_address: fromWalletAddress,
        to_wallet_address: toWalletAddress,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to track recent send: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error tracking recent send:', error);
    throw error;
  }
}
