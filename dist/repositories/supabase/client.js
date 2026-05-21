import { createClient } from "@supabase/supabase-js";
/**
 * Supabase client singleton. Dùng service_role key (backend only) để bypass RLS.
 * Nếu muốn enforce RLS, dùng anon key và pass user JWT qua auth header.
 */
let _client = null;
export function getSupabase() {
    if (_client)
        return _client;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    if (!url) {
        throw new Error("[supabase] SUPABASE_URL chưa được đặt trong .env. Không thể khởi tạo Supabase client.");
    }
    if (!key) {
        throw new Error("[supabase] SUPABASE_SERVICE_ROLE_KEY (hoặc SUPABASE_KEY) chưa được đặt trong .env.");
    }
    _client = createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
    return _client;
}
