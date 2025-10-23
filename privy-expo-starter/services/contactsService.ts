// Cloudflare Worker API base URL
const API_BASE_URL = 'https://pyusd-contacts-api.dawid-pisarczyk.workers.dev';

export interface Contact {
  id?: number;
  user_wallet_address: string;
  contact_name: string;
  contact_address: string;
  avatar?: string;
  created_at?: number;
  updated_at?: number;
}

export interface RecentContact {
  contact_address: string;
  last_sent_at: number;
  contact_name?: string;
  avatar?: string;
}

/**
 * Get all contacts for a wallet address
 */
export async function getContacts(walletAddress: string): Promise<Contact[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts/${walletAddress.toLowerCase()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch contacts: ${response.statusText}`);
    }

    const data = await response.json();
    return data.contacts || [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
}

/**
 * Get recent contacts for a wallet address
 */
export async function getRecentContacts(walletAddress: string): Promise<RecentContact[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/recent/${walletAddress.toLowerCase()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch recent contacts: ${response.statusText}`);
    }

    const data = await response.json();
    return data.recent || [];
  } catch (error) {
    console.error('Error fetching recent contacts:', error);
    throw error;
  }
}

/**
 * Add a new contact
 */
export async function addContact(contact: Contact): Promise<{ success: boolean; id?: number }> {
  try {
    console.log('Adding contact:', contact);
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to add contact: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Add contact result:', result);
    return result;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
}

/**
 * Update an existing contact
 */
export async function updateContact(
  contactId: number,
  updates: Partial<Contact>
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update contact: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
}

/**
 * Delete a contact
 */
export async function deleteContact(contactId: number): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete contact: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}

/**
 * Track a recent transaction (for recent contacts list)
 */
export async function trackRecentTransaction(
  userWalletAddress: string,
  contactAddress: string
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/recent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_wallet_address: userWalletAddress,
        contact_address: contactAddress,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to track recent transaction: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error tracking recent transaction:', error);
    throw error;
  }
}

/**
 * Search contacts by name or address
 */
export async function searchContacts(
  walletAddress: string,
  query: string
): Promise<Contact[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/search/${walletAddress.toLowerCase()}?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to search contacts: ${response.statusText}`);
    }

    const data = await response.json();
    return data.contacts || [];
  } catch (error) {
    console.error('Error searching contacts:', error);
    throw error;
  }
}
