// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bvlxfnlinqxkgwrhlqra.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bHhmbmxpbnF4a2d3cmhscXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwMjQ1NTcsImV4cCI6MjA1MTYwMDU1N30.GiQZd-Henznq_lDWKaaTjZDrrKnC4-3gh7VXZEiN0KM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);