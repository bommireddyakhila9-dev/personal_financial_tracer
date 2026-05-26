import "dotenv/config";
import cors from "cors";
import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/expenses", async (_req, res) => {
  const { data, error } = await supabase
    .from("expenses")
    .select("id, amount, category, date, tags, payment_method, notes")
    .order("date", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

app.post("/api/expenses", async (req, res) => {
  const { amount, category, date, tags = [], payment_method, notes = "" } = req.body;

  const { data, error } = await supabase
    .from("expenses")
    .insert({ amount, category, date, tags, payment_method, notes })
    .select("id, amount, category, date, tags, payment_method, notes")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

app.delete("/api/expenses/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
