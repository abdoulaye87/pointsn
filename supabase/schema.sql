-- =============================================
-- IASN Platform - Supabase Schema
-- =============================================

-- Activer l'extension UUID si pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

-- Statut de paiement
CREATE TYPE payment_status AS ENUM ('trial', 'active', 'pending', 'late');

-- Statut de modification
CREATE TYPE modification_status AS ENUM ('pending', 'processing', 'completed');

-- =============================================
-- TABLES
-- =============================================

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

-- Table des modifications demandées
CREATE TABLE IF NOT EXISTS modifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  request TEXT NOT NULL,
  status modification_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
CREATE INDEX IF NOT EXISTS idx_clients_payment_status ON clients(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_modifications_client_id ON modifications(client_id);
CREATE INDEX IF NOT EXISTS idx_modifications_status ON modifications(status);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Activer RLS sur toutes les tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifications ENABLE ROW LEVEL SECURITY;

-- Politique: Permettre toutes les opérations (public pour l'instant)
-- À sécuriser selon vos besoins avec auth.uid() pour les utilisateurs authentifiés

CREATE POLICY "Permettre lecture clients" ON clients
  FOR SELECT USING (true);

CREATE POLICY "Permettre écriture clients" ON clients
  FOR ALL USING (true);

CREATE POLICY "Permettre lecture payments" ON payments
  FOR SELECT USING (true);

CREATE POLICY "Permettre écriture payments" ON payments
  FOR ALL USING (true);

CREATE POLICY "Permettre lecture modifications" ON modifications
  FOR SELECT USING (true);

CREATE POLICY "Permettre écriture modifications" ON modifications
  FOR ALL USING (true);

-- =============================================
-- FONCTIONS ET TRIGGERS
-- =============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour clients
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DONNÉES DE TEST (optionnel)
-- =============================================

-- Décommenter pour ajouter des données de test
/*
INSERT INTO clients (name, activity, city, address, whatsapp, slug, trial_ends_at, payment_status)
VALUES
  ('Restaurant Le Djolof', 'restaurant', 'Dakar', 'Plateau, Rue 10', '+221771234567', 'restaurant-djolof', NOW() + INTERVAL '7 days', 'trial'),
  ('Salon Coiffure Amina', 'coiffure', 'Thiès', 'Centre ville', '+221779876543', 'coiffure-amina', NOW() + INTERVAL '7 days', 'trial');
*/
