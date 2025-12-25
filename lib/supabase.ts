
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xifsxhhauspdpatbpcof.supabase.co';
const supabaseAnonKey = 'sb_publishable_dBsT3a1Y8p2wOG6CU8VcKw_ZwigVg0V';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
