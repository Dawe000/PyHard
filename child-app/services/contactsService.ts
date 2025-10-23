import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Contact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
  created_at: number;
  last_sent_at?: number;
}

const CONTACTS_STORAGE_KEY = 'child_contacts';

/**
 * Get all contacts for the child
 */
export async function getContacts(): Promise<Contact[]> {
  try {
    const contactsJson = await AsyncStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!contactsJson) {
      return [];
    }
    return JSON.parse(contactsJson);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

/**
 * Add a new contact
 */
export async function addContact(contact: Omit<Contact, 'id' | 'created_at'>): Promise<Contact> {
  try {
    const contacts = await getContacts();
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
      created_at: Date.now(),
    };
    
    contacts.push(newContact);
    await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
    
    return newContact;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
}

/**
 * Update an existing contact
 */
export async function updateContact(contactId: string, updates: Partial<Contact>): Promise<Contact | null> {
  try {
    const contacts = await getContacts();
    const contactIndex = contacts.findIndex(c => c.id === contactId);
    
    if (contactIndex === -1) {
      return null;
    }
    
    contacts[contactIndex] = { ...contacts[contactIndex], ...updates };
    await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
    
    return contacts[contactIndex];
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
}

/**
 * Delete a contact
 */
export async function deleteContact(contactId: string): Promise<boolean> {
  try {
    const contacts = await getContacts();
    const filteredContacts = contacts.filter(c => c.id !== contactId);
    
    if (filteredContacts.length === contacts.length) {
      return false; // Contact not found
    }
    
    await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(filteredContacts));
    return true;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}

/**
 * Search contacts by name or address
 */
export async function searchContacts(query: string): Promise<Contact[]> {
  try {
    const contacts = await getContacts();
    const lowercaseQuery = query.toLowerCase();
    
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      contact.address.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error('Error searching contacts:', error);
    return [];
  }
}

/**
 * Get recent contacts (last 5 sent to)
 */
export async function getRecentContacts(): Promise<Contact[]> {
  try {
    const contacts = await getContacts();
    return contacts
      .filter(contact => contact.last_sent_at)
      .sort((a, b) => (b.last_sent_at || 0) - (a.last_sent_at || 0))
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching recent contacts:', error);
    return [];
  }
}

/**
 * Track a transaction to a contact (update last_sent_at)
 */
export async function trackTransaction(contactAddress: string): Promise<void> {
  try {
    const contacts = await getContacts();
    const contact = contacts.find(c => c.address.toLowerCase() === contactAddress.toLowerCase());
    
    if (contact) {
      contact.last_sent_at = Date.now();
      await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
    }
  } catch (error) {
    console.error('Error tracking transaction:', error);
  }
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
