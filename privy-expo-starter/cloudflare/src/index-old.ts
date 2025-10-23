interface Env {
  DB: D1Database;
}

interface Contact {
  id?: number;
  user_wallet_address: string;
  contact_name: string;
  contact_address: string;
  avatar?: string;
  created_at?: number;
  updated_at?: number;
}

interface RecentContact {
  user_wallet_address: string;
  contact_address: string;
  last_sent_at?: number;
}

// CORS headers for mobile app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // GET /contacts/:walletAddress - Get all contacts for a user
      if (request.method === 'GET' && path.match(/^\/contacts\/0x[a-fA-F0-9]{40}$/)) {
        const walletAddress = path.split('/')[2].toLowerCase();

        const { results } = await env.DB.prepare(
          'SELECT * FROM contacts WHERE user_wallet_address = ? ORDER BY contact_name ASC'
        ).bind(walletAddress).all();

        return new Response(JSON.stringify({ contacts: results || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /recent/:walletAddress - Get recent contacts for a user
      if (request.method === 'GET' && path.match(/^\/recent\/0x[a-fA-F0-9]{40}$/)) {
        const walletAddress = path.split('/')[2].toLowerCase();

        const { results } = await env.DB.prepare(`
          SELECT rc.contact_address, rc.last_sent_at, c.contact_name, c.avatar
          FROM recent_contacts rc
          LEFT JOIN contacts c ON rc.user_wallet_address = c.user_wallet_address
            AND rc.contact_address = c.contact_address
          WHERE rc.user_wallet_address = ?
          ORDER BY rc.last_sent_at DESC
          LIMIT 5
        `).bind(walletAddress).all();

        return new Response(JSON.stringify({ recent: results || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST /contacts - Add a new contact
      if (request.method === 'POST' && path === '/contacts') {
        const contact: Contact = await request.json();

        console.log('Received contact:', contact);

        if (!contact.user_wallet_address || !contact.contact_name || !contact.contact_address) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const userWallet = contact.user_wallet_address.toLowerCase();
        const contactAddress = contact.contact_address.toLowerCase();

        console.log('Normalized addresses - user:', userWallet, 'contact:', contactAddress);

        try {
          // Ensure user exists
          console.log('Ensuring user exists...');
          await env.DB.prepare(
            'INSERT OR IGNORE INTO users (wallet_address) VALUES (?)'
          ).bind(userWallet).run();

          // Insert contact
          console.log('Inserting contact...');
          const result = await env.DB.prepare(
            'INSERT INTO contacts (user_wallet_address, contact_name, contact_address, avatar) VALUES (?, ?, ?, ?)'
          ).bind(userWallet, contact.contact_name, contactAddress, contact.avatar || null).run();

          console.log('Contact inserted successfully, ID:', result.meta.last_row_id);

          return new Response(JSON.stringify({
            success: true,
            id: result.meta.last_row_id
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (dbError: any) {
          console.error('Database error:', dbError);
          return new Response(JSON.stringify({
            error: 'Database error: ' + dbError.message,
            details: dbError.toString()
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // PUT /contacts/:id - Update a contact
      if (request.method === 'PUT' && path.match(/^\/contacts\/\d+$/)) {
        const contactId = parseInt(path.split('/')[2]);
        const updates: Partial<Contact> = await request.json();

        await env.DB.prepare(
          'UPDATE contacts SET contact_name = ?, contact_address = ?, avatar = ?, updated_at = ? WHERE id = ?'
        ).bind(
          updates.contact_name,
          updates.contact_address?.toLowerCase(),
          updates.avatar || null,
          Math.floor(Date.now() / 1000),
          contactId
        ).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // DELETE /contacts/:id - Delete a contact
      if (request.method === 'DELETE' && path.match(/^\/contacts\/\d+$/)) {
        const contactId = parseInt(path.split('/')[2]);

        await env.DB.prepare('DELETE FROM contacts WHERE id = ?').bind(contactId).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST /recent - Track a recent transaction
      if (request.method === 'POST' && path === '/recent') {
        const data: RecentContact = await request.json();

        if (!data.user_wallet_address || !data.contact_address) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const userWallet = data.user_wallet_address.toLowerCase();
        const contactAddress = data.contact_address.toLowerCase();

        // Ensure user exists
        await env.DB.prepare(
          'INSERT OR IGNORE INTO users (wallet_address) VALUES (?)'
        ).bind(userWallet).run();

        // Insert or update recent contact
        await env.DB.prepare(`
          INSERT INTO recent_contacts (user_wallet_address, contact_address, last_sent_at)
          VALUES (?, ?, ?)
          ON CONFLICT(user_wallet_address, contact_address)
          DO UPDATE SET last_sent_at = ?
        `).bind(
          userWallet,
          contactAddress,
          Math.floor(Date.now() / 1000),
          Math.floor(Date.now() / 1000)
        ).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /search/:walletAddress?q=query - Search contacts
      if (request.method === 'GET' && path.match(/^\/search\/0x[a-fA-F0-9]{40}$/)) {
        const walletAddress = path.split('/')[2].toLowerCase();
        const query = url.searchParams.get('q') || '';

        const { results } = await env.DB.prepare(
          'SELECT * FROM contacts WHERE user_wallet_address = ? AND (contact_name LIKE ? OR contact_address LIKE ?) ORDER BY contact_name ASC'
        ).bind(walletAddress, `%${query}%`, `%${query}%`).all();

        return new Response(JSON.stringify({ contacts: results || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not found', {
        status: 404,
        headers: corsHeaders
      });

    } catch (error: any) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
