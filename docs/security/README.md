# 🛡️ TaskPilot – Security, Architecture & Cloud Protection

Version : v1.0 – Novembre 2025  
Author : Mathieu Scicluna

TaskPilot est une application SaaS minimaliste conçue pour démontrer la mise en place d’une architecture cloud sécurisée, incluant authentification, RBAC, Row Level Security, audit logs, protections anti-abus et un CRUD entièrement sécurisé.

---

## 🧩 Fonctionnalités principales

- 🔐 Authentification sécurisée via Supabase
- 👤 Rôles RBAC : `admin` et `user`
- 🧩 Row Level Security (RLS) complète
- 📝 Audit Logs auto-générés
- ⚠️ Anti-spam (cooldown + limite journalière)
- 🧱 Validation stricte avec Zod
- 📦 CRUD sécurisé des tâches
- 🔒 Middleware Next.js bloquant tout accès non autorisé
- 🧬 Séparation propre Client / Serveur / Middleware

---

## 🔐 Authentification & Rôles

L’auth utilise `@supabase/auth-helpers-nextjs`, assurant :  
✔ cookies HTTPOnly  
✔ session synchrone client ↔ serveur  
✔ récupération "server-safe" avec `supabase.auth.getUser()`

Chaque utilisateur possède un rôle défini dans `raw_user_meta_data.role` :

- **admin** → accès total
- **user** → accès uniquement à ses propres tâches

---

## 🗂️ Tables Supabase

### Table `tasks`

```sql
id uuid PRIMARY KEY
created_at timestamptz DEFAULT now()
title text
is_done boolean DEFAULT false
user_id uuid REFERENCES auth.users(id)
```

Table audit_logs :

id uuid PRIMARY KEY DEFAULT gen_random_uuid()
created_at timestamptz DEFAULT now()
user_id uuid
action text
target text
target_id text

🔒 RLS – Row Level Security
RLS sur tasks

✔ Un utilisateur ne voit que ses tâches :

CREATE POLICY "User can manage own tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

✔ L’admin a un accès total :

CREATE POLICY "Admin can manage all tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'admin')
WITH CHECK (auth.jwt()->>'role' = 'admin');

RLS sur audit_logs

✔ L’utilisateur ne peut insérer que ses propres logs :

CREATE POLICY "users_can_insert_their_own_logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

✔ Seul un admin peut les lire :

CREATE POLICY "admins_can_read_all_logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (auth.jwt()->>'role' = 'admin');

📝 Audit Logs

Chaque action sensible génère un log automatique :

Action Description
login Connexion
logout Déconnexion
task_create Création de tâche
task_update Modification
task_delete Suppression

Exemple d’insertion :

await supabase.from("audit_logs").insert({
user_id: user.id,
action: "task_create",
target: "tasks",
target_id: inserted.id,
ip_hash: hashedIp
});

L’adresse IP est hachée en SHA-256 (compatibilité RGPD).

🛡️ Sécurité côté client
Validation Zod
export const taskTitleSchema = z
.string()
.min(3, "La tâche doit contenir au moins 3 caractères.")
.max(200, "La tâche est trop longue.");

Cooldown anti-spam

5 secondes entre chaque ajout :

if (Date.now() - lastAddTime < 5000) {
setErrorMessage("Veuillez patienter quelques secondes.");
return;
}

Limite journalière

Max 50 tâches / utilisateur / 24h :

const { count } = await supabase
.from("tasks")
.select("id", { count: "exact", head: true })
.eq("user_id", user.id)
.gte("created_at", since);

🧱 Middleware Next.js – Protection des routes
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
const res = NextResponse.next();
const supabase = createMiddlewareClient({ req, res });

const { data: { session } } = await supabase.auth.getSession();

if (!session)
return NextResponse.redirect(new URL("/auth/login", req.url));

return res;
}

Toute tentative d’accès non authentifié → redirection immédiate.ip_hash text
