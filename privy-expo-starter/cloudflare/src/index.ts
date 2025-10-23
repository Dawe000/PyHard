interface Env {
  DB: D1Database;
}

interface UserProfile {
  id?: number;
  wallet_address: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: number;
  updated_at?: number;
}

interface RecentSend {
  from_wallet_address: string;
  to_wallet_address: string;
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
      // POST /profile - Create or update user profile
      if (request.method === 'POST' && path === '/profile') {
        const profile: UserProfile = await request.json();

        console.log('Received profile:', profile);

        if (!profile.wallet_address) {
          return new Response(JSON.stringify({ error: 'Missing wallet_address' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const walletAddress = profile.wallet_address.toLowerCase();

        // Validate username if provided
        if (profile.username) {
          const username = profile.username.toLowerCase().trim();

          // Username validation: 3-20 chars, alphanumeric + underscore only
          if (!/^[a-z0-9_]{3,20}$/.test(username)) {
            return new Response(JSON.stringify({
              error: 'Username must be 3-20 characters (lowercase letters, numbers, underscore only)'
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Check if username is already taken by another wallet
          const existingUser = await env.DB.prepare(
            'SELECT wallet_address FROM users WHERE username = ? AND wallet_address != ?'
          ).bind(username, walletAddress).first();

          if (existingUser) {
            return new Response(JSON.stringify({ error: 'Username already taken' }), {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          profile.username = username;
        }

        try {
          // Upsert user profile
          await env.DB.prepare(`
            INSERT INTO users (wallet_address, username, display_name, avatar_url, bio, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(wallet_address) DO UPDATE SET
              username = COALESCE(excluded.username, username),
              display_name = COALESCE(excluded.display_name, display_name),
              avatar_url = COALESCE(excluded.avatar_url, avatar_url),
              bio = COALESCE(excluded.bio, bio),
              updated_at = excluded.updated_at
          `).bind(
            walletAddress,
            profile.username || null,
            profile.display_name || null,
            profile.avatar_url || null,
            profile.bio || null,
            Math.floor(Date.now() / 1000)
          ).run();

          return new Response(JSON.stringify({ success: true }), {
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

      // GET /profile/:identifier - Get user profile by wallet or username
      if (request.method === 'GET' && path.startsWith('/profile/')) {
        const identifier = path.split('/')[2].toLowerCase();

        let query: string;
        if (identifier.startsWith('0x')) {
          // Search by wallet address
          query = 'SELECT * FROM users WHERE wallet_address = ?';
        } else {
          // Search by username
          query = 'SELECT * FROM users WHERE username = ?';
        }

        const profile = await env.DB.prepare(query).bind(identifier).first();

        if (!profile) {
          return new Response(JSON.stringify({ error: 'Profile not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ profile }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /search?q=query - Search for users by username or display name
      if (request.method === 'GET' && path === '/search') {
        const query = url.searchParams.get('q') || '';

        if (query.length < 2) {
          return new Response(JSON.stringify({ users: [] }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { results } = await env.DB.prepare(`
          SELECT wallet_address, username, display_name, avatar_url
          FROM users
          WHERE username LIKE ? OR display_name LIKE ?
          ORDER BY username ASC
          LIMIT 20
        `).bind(`%${query}%`, `%${query}%`).all();

        return new Response(JSON.stringify({ users: results || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /recent/:walletAddress - Get recent sends for a user
      if (request.method === 'GET' && path.match(/^\/recent\/0x[a-fA-F0-9]{40}$/)) {
        const walletAddress = path.split('/')[2].toLowerCase();

        const { results } = await env.DB.prepare(`
          SELECT rs.to_wallet_address, rs.last_sent_at, u.username, u.display_name, u.avatar_url
          FROM recent_sends rs
          LEFT JOIN users u ON rs.to_wallet_address = u.wallet_address
          WHERE rs.from_wallet_address = ?
          ORDER BY rs.last_sent_at DESC
          LIMIT 10
        `).bind(walletAddress).all();

        return new Response(JSON.stringify({ recent: results || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST /recent - Track a recent send
      if (request.method === 'POST' && path === '/recent') {
        const data: RecentSend = await request.json();

        if (!data.from_wallet_address || !data.to_wallet_address) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const fromWallet = data.from_wallet_address.toLowerCase();
        const toWallet = data.to_wallet_address.toLowerCase();

        // Ensure from user exists
        await env.DB.prepare(
          'INSERT OR IGNORE INTO users (wallet_address) VALUES (?)'
        ).bind(fromWallet).run();

        // Ensure to user exists
        await env.DB.prepare(
          'INSERT OR IGNORE INTO users (wallet_address) VALUES (?)'
        ).bind(toWallet).run();

        // Insert or update recent send
        await env.DB.prepare(`
          INSERT INTO recent_sends (from_wallet_address, to_wallet_address, last_sent_at)
          VALUES (?, ?, ?)
          ON CONFLICT(from_wallet_address, to_wallet_address)
          DO UPDATE SET last_sent_at = ?
        `).bind(
          fromWallet,
          toWallet,
          Math.floor(Date.now() / 1000),
          Math.floor(Date.now() / 1000)
        ).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /check-username/:username - Check if username is available
      if (request.method === 'GET' && path.startsWith('/check-username/')) {
        const username = path.split('/')[2].toLowerCase().trim();

        if (!/^[a-z0-9_]{3,20}$/.test(username)) {
          return new Response(JSON.stringify({
            available: false,
            error: 'Invalid username format'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const existingUser = await env.DB.prepare(
          'SELECT id FROM users WHERE username = ?'
        ).bind(username).first();

        return new Response(JSON.stringify({
          available: !existingUser,
          username
        }), {
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
