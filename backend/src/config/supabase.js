const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const supabaseAuth = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const supabase = supabaseAdmin;

module.exports = { supabase, supabaseAdmin, supabaseAuth };
