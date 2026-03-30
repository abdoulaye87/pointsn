import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const CREATE_TABLES_SQL = `
-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Créer les ENUMs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('trial', 'active', 'pending', 'late');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'modification_status') THEN
    CREATE TYPE modification_status AS ENUM ('pending', 'processing', 'completed');
  END IF;
END
$$;

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  activity VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  trial_ends_at TIMESTAMPTZ DEFAULT NOW(),
  payment_status payment_status DEFAULT 'trial',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 2000,
  status payment_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des modifications
CREATE TABLE IF NOT EXISTS modifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  request TEXT NOT NULL,
  status modification_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
CREATE INDEX IF NOT EXISTS idx_clients_payment_status ON clients(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_modifications_client_id ON modifications(client_id);

-- Fonction updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`

const ENABLE_RLS_SQL = `
-- Activer RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifications ENABLE ROW LEVEL SECURITY;

-- Politiques (permettre tout pour l'instant)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permettre lecture clients') THEN
    CREATE POLICY "Permettre lecture clients" ON clients FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permettre écriture clients') THEN
    CREATE POLICY "Permettre écriture clients" ON clients FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permettre lecture payments') THEN
    CREATE POLICY "Permettre lecture payments" ON payments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permettre écriture payments') THEN
    CREATE POLICY "Permettre écriture payments" ON payments FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permettre lecture modifications') THEN
    CREATE POLICY "Permettre lecture modifications" ON modifications FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permettre écriture modifications') THEN
    CREATE POLICY "Permettre écriture modifications" ON modifications FOR ALL USING (true);
  END IF;
END
$$;
`

export async function GET() {
  try {
    const supabase = createServerClient()

    // Exécuter le SQL pour créer les tables
    const { error: error1 } = await supabase.rpc('exec_sql', { sql: CREATE_TABLES_SQL })
    
    // Si la fonction RPC n'existe pas, on utilise une autre approche
    if (error1) {
      return NextResponse.json({
        success: false,
        message: 'Impossible d\'exécuter le SQL directement. Utilisez le dashboard Supabase.',
        error: error1.message,
        instructions: [
          '1. Allez sur https://supabase.com/dashboard',
          '2. Sélectionnez votre projet',
          '3. Allez dans SQL Editor',
          '4. Copiez-collez le contenu de supabase/schema.sql',
          '5. Exécutez le script'
        ],
        schemaFile: '/supabase/schema.sql'
      }, { status: 400 })
    }

    // Activer RLS
    await supabase.rpc('exec_sql', { sql: ENABLE_RLS_SQL })

    return NextResponse.json({
      success: true,
      message: 'Tables créées avec succès!',
      tables: ['clients', 'payments', 'modifications']
    })

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
