import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bxlvmwnuqghcyoddnlsf.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4bHZtd251cWdoY3lvZGRubHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzMxOTgsImV4cCI6MjA3ODU0OTE5OH0.O-NSXkeJg6gTDwhBisjv18BIhSOQRnde34zVD9vcO_E";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
