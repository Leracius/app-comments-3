import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://emfrjjyseviapxdmqmrd.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_KEY ||
  "sb_publishable_LPIzvydQFe-L3Pv-rlV6yQ_q0dacAdz";

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

