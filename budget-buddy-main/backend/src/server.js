import "dotenv/config";
import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";
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
const localExpenses = [];

function isNetworkError(error) {
  return /fetch failed|network/i.test(String(error?.message || error));
}

function toExpensePayload(body) {
  return {
    amount: Number(body.amount),
    category: body.category,
    date: body.date,
    tags: Array.isArray(body.tags) ? body.tags : [],
    payment_method: body.payment_method || body.paymentMethod,
    notes: body.notes || "",
  };
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/expenses", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("id, amount, category, date, tags, payment_method, notes")
      .order("date", { ascending: false });

    if (error) {
      if (isNetworkError(error)) {
        return res.json(localExpenses.slice().sort((a, b) => b.date.localeCompare(a.date)));
      }
      return res.status(500).json({ error: error.message });
    }
    return res.json(data);
  } catch (error) {
    if (!isNetworkError(error)) return res.status(500).json({ error: error.message });
    return res.json(localExpenses.slice().sort((a, b) => b.date.localeCompare(a.date)));
  }
});

app.post("/api/expenses", async (req, res) => {
  const expense = toExpensePayload(req.body);

  try {
    const { data, error } = await supabase
      .from("expenses")
      .insert(expense)
      .select("id, amount, category, date, tags, payment_method, notes")
      .single();

    if (error) {
      if (isNetworkError(error)) {
        const created = { ...expense, id: randomUUID() };
        localExpenses.unshift(created);
        return res.status(201).json(created);
      }
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(data);
  } catch (error) {
    if (!isNetworkError(error)) return res.status(500).json({ error: error.message });
    const created = { ...expense, id: randomUUID() };
    localExpenses.unshift(created);
    return res.status(201).json(created);
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      if (isNetworkError(error)) {
        const index = localExpenses.findIndex((expense) => expense.id === id);
        if (index >= 0) localExpenses.splice(index, 1);
        return res.status(204).send();
      }
      return res.status(500).json({ error: error.message });
    }
    return res.status(204).send();
  } catch (error) {
    if (!isNetworkError(error)) return res.status(500).json({ error: error.message });
    const index = localExpenses.findIndex((expense) => expense.id === id);
    if (index >= 0) localExpenses.splice(index, 1);
    return res.status(204).send();
  }
});

function listen(preferredPort) {
  const server = app.listen(preferredPort, () => {
    const address = server.address();
    const activePort = typeof address === "object" && address ? address.port : preferredPort;
    console.log(`Backend listening on http://localhost:${activePort}`);
  });

  server.on("error", (error) => {
    if (error.code !== "EADDRINUSE") throw error;
    if (process.env.PORT) throw error;

    const nextPort = preferredPort + 1;
    console.warn(`Port ${preferredPort} is already in use, trying ${nextPort}...`);
    listen(nextPort);
  });
}

listen(port);
