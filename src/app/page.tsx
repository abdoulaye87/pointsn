'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Globe, Loader2, CheckCircle2, ExternalLink, Edit3, MessageCircle,
  User, Settings, ArrowLeft, Copy, Check, AlertCircle, Users, Wallet,
  Search, ChevronDown, X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { domains, popularDomains, searchDomains, type DomainConfig } from '@/config/domains';

type Screen = 'welcome' | 'step-domain' | 'step-name' | 'step-city' | 'step-address' | 'step-whatsapp' | 'step-questions' | 'loading' | 'result' | 'modification' | 'dashboard' | 'admin';

interface ClientData {
  id: string;
  name: string;
  activity: string;
  city: string;
  address: string;
  whatsapp: string;
  slug: string;
  createdAt: string;
  trialEndsAt: string;
  paymentStatus: string;
  payments: { id: string; amount: number; status: string; createdAt: string }[];
  modifications: { id: string; request: string; status: string; createdAt: string }[];
}

interface AdminStats {
  totalClients: number;
  activeSites: number;
  estimatedRevenue: number;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [selectedDomain, setSelectedDomain] = useState<DomainConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    activity: '',
    city: '',
    address: '',
    whatsapp: '',
    specificAnswers: {} as Record<string, string>,
  });
  const [createdClient, setCreatedClient] = useState<ClientData | null>(null);
  const [modificationRequest, setModificationRequest] = useState('');
  const [copied, setCopied] = useState(false);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminClients, setAdminClients] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'main' | 'admin'>('main');
  const [adminKey, setAdminKey] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Filtered domains
  const filteredDomains = useMemo(() => {
    return searchDomains(searchQuery);
  }, [searchQuery]);

  // Popular domains
  const popularDomainsList = useMemo(() => {
    return popularDomains.map(id => domains[id]).filter(Boolean);
  }, []);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'X-Client-Id': localStorage.getItem('iasn_client_id') || '',
  });

  const adminHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('iasn_admin_key') || ''}`,
  });

  const fetchClient = async (clientId: string) => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCreatedClient(data);
        setFormData({
          name: data.name,
          activity: data.activity,
          city: data.city,
          address: data.address,
          whatsapp: data.whatsapp,
          specificAnswers: {},
        });
      }
    } catch (error) {
      console.error('Error fetching client:', error);
    }
  };

  useEffect(() => {
    const savedClientId = localStorage.getItem('iasn_client_id');
    if (savedClientId) {
      fetchClient(savedClientId);
    }
  }, []);

  const resetForm = () => {
    localStorage.removeItem('iasn_client_id');
    setCreatedClient(null);
    setSelectedDomain(null);
    setFormData({
      name: '',
      activity: '',
      city: '',
      address: '',
      whatsapp: '',
      specificAnswers: {},
    });
    setScreen('step-domain');
  };

  const createSite = async () => {
    setScreen('loading');
    
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          activity: selectedDomain?.id || formData.activity,
          city: formData.city,
          address: formData.address,
          whatsapp: formData.whatsapp,
          specificAnswers: formData.specificAnswers,
        }),
      });
      
      if (res.ok) {
        const client = await res.json();
        setCreatedClient(client);
        localStorage.setItem('iasn_client_id', client.id);
        setScreen('result');
      } else {
        const error = await res.json();
        toast({ title: 'Erreur', description: error.error, variant: 'destructive' });
        setScreen('step-whatsapp');
      }
    } catch (error) {
      console.error('Error creating site:', error);
      toast({ title: 'Erreur', description: 'Impossible de créer le site', variant: 'destructive' });
      setScreen('step-whatsapp');
    }
  };

  const submitModification = async () => {
    if (!createdClient || !modificationRequest.trim()) return;
    
    try {
      const res = await fetch('/api/modifications', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          clientId: createdClient.id,
          request: modificationRequest,
        }),
      });
      
      if (res.ok) {
        toast({ title: 'Demande envoyée !', description: 'Nous traiterons votre demande rapidement.' });
        setModificationRequest('');
        setScreen('dashboard');
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer la demande', variant: 'destructive' });
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/${createdClient?.slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadAdminData = async () => {
    try {
      const res = await fetch('/api/admin', { headers: adminHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data.stats);
        setAdminClients(data.clients);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const updatePaymentStatus = async (clientId: string, action: 'validate' | 'late') => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ clientId, action }),
      });
      
      if (res.ok) {
        toast({ title: action === 'validate' ? 'Paiement validé' : 'Marqué en retard' });
        loadAdminData();
      }
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const getProgress = () => {
    const steps: Screen[] = ['step-domain', 'step-name', 'step-city', 'step-address', 'step-whatsapp'];
    const currentIndex = steps.indexOf(screen);
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / 5) * 100;
  };

  const getStepNumber = () => {
    const steps: Screen[] = ['step-domain', 'step-name', 'step-city', 'step-address', 'step-whatsapp'];
    const currentIndex = steps.indexOf(screen);
    if (currentIndex === -1) return 0;
    return currentIndex + 1;
  };

  useEffect(() => {
    if (viewMode === 'admin') {
      loadAdminData();
    }
  }, [viewMode]);

  // ============ WELCOME SCREEN ============
  if (screen === 'welcome') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <button
          onClick={() => {
            if (viewMode === 'admin') {
              setViewMode('main');
              setScreen('welcome');
            } else if (localStorage.getItem('iasn_admin_key')) {
              setViewMode('admin');
              loadAdminData();
              setScreen('admin');
            } else {
              setShowAdminLogin(true);
            }
          }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <Settings className="w-5 h-5" />
        </button>

        {showAdminLogin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold mb-4">🔐 Accès Admin</h3>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Clé admin"
                className="w-full p-3 border-2 rounded-xl mb-4 text-center"
              />
              <div className="flex gap-2">
                <Button onClick={() => setShowAdminLogin(false)} variant="outline" className="flex-1">Annuler</Button>
                <Button onClick={() => {
                  localStorage.setItem('iasn_admin_key', adminKey);
                  setShowAdminLogin(false);
                  setViewMode('admin');
                  loadAdminData();
                  setScreen('admin');
                }} disabled={!adminKey.trim()} className="flex-1 bg-blue-500 hover:bg-blue-600">
                  Connexion
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <img src="/illustration.png" alt="Créer un site internet" className="w-40 h-40 object-contain" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 px-4">
          👉 Crée ton site internet en 1 minute
        </h1>

        <p className="text-lg md:text-xl text-gray-500 text-center mb-12">
          👉 Simple • Rapide • Professionnel
        </p>

        <Button onClick={resetForm} className="w-full max-w-xs h-16 text-xl font-bold bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg">
          Commencer
        </Button>

        {createdClient && (
          <Button onClick={() => setScreen('dashboard')} variant="outline" className="mt-4 w-full max-w-xs h-12 text-lg rounded-xl">
            <User className="w-5 h-5 mr-2" />
            Mon espace ({createdClient.name})
          </Button>
        )}
      </div>
    );
  }

  // ============ ADMIN SCREEN ============
  if (screen === 'admin' || viewMode === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { setViewMode('main'); setScreen('welcome'); }} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" /> Retour
          </button>
          <h1 className="text-xl font-bold">🛠️ Admin</h1>
        </div>

        {adminStats && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="bg-white">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{adminStats.totalClients}</div>
                <div className="text-xs text-gray-500">Clients</div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-4 text-center">
                <Globe className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{adminStats.activeSites}</div>
                <div className="text-xs text-gray-500">Sites actifs</div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-4 text-center">
                <Wallet className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">{adminStats.estimatedRevenue.toLocaleString()}</div>
                <div className="text-xs text-gray-500">FCFA/mois</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-white overflow-hidden">
          <div className="p-4 border-b"><h2 className="font-bold">📊 Clients</h2></div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {adminClients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Aucun client</div>
            ) : (
              adminClients.map((client) => (
                <div key={client.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.activity} • {client.city}</div>
                    </div>
                    <Badge variant={client.paymentStatus === 'active' ? 'default' : 'secondary'}
                      className={client.paymentStatus === 'active' ? 'bg-green-500' : 'bg-blue-500'}>
                      {client.paymentStatus === 'active' ? 'Actif' : 'Essai'}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => window.open(`https://wa.me/${client.whatsapp.replace('+', '')}`, '_blank')}>
                      <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
                    </Button>
                    <Button size="sm" onClick={() => window.open(`/${client.slug}`, '_blank')}>Voir</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    );
  }

  // ============ FORM STEPS ============
  if (['step-domain', 'step-name', 'step-city', 'step-address', 'step-whatsapp', 'step-questions'].includes(screen)) {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <button onClick={() => {
              if (screen === 'step-domain') setScreen('welcome');
              else if (screen === 'step-name') setScreen('step-domain');
              else if (screen === 'step-city') setScreen('step-name');
              else if (screen === 'step-address') setScreen('step-city');
              else if (screen === 'step-whatsapp') setScreen('step-address');
            }} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="text-lg font-medium text-gray-600">Étape {getStepNumber()} / 5</span>
            <div className="w-6" />
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          
          {/* STEP: Domain Selection */}
          {screen === 'step-domain' && (
            <>
              <h2 className="text-2xl font-bold text-center mb-6">Quel est votre domaine ?</h2>
              
              {/* Popular domains */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {popularDomainsList.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => { setSelectedDomain(domain); setFormData({...formData, activity: domain.id}); setScreen('step-name'); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedDomain?.id === domain.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <span className="text-2xl">{domain.icon}</span>
                    <p className="font-semibold mt-1">{domain.name}</p>
                  </button>
                ))}
              </div>

              {/* Search dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 flex items-center justify-between text-gray-600 hover:border-green-300"
                >
                  <span><Search className="w-5 h-5 inline mr-2" /> Autres domaines...</span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-hidden">
                    <div className="p-3 border-b sticky top-0 bg-white">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher un domaine..."
                        className="w-full"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto max-h-60">
                      {filteredDomains.map((domain) => (
                        <button
                          key={domain.id}
                          onClick={() => {
                            setSelectedDomain(domain);
                            setFormData({...formData, activity: domain.id});
                            setShowDropdown(false);
                            setSearchQuery('');
                            setScreen('step-name');
                          }}
                          className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3"
                        >
                          <span className="text-xl">{domain.icon}</span>
                          <span>{domain.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* STEP: Name */}
          {screen === 'step-name' && (
            <>
              <h2 className="text-2xl font-bold text-center mb-2">Nom de votre {selectedDomain?.name.toLowerCase() || 'activité'}</h2>
              <p className="text-center text-gray-500 mb-6">Comment s&apos;appelle votre entreprise ?</p>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Restaurant Le Djolof"
                className="h-16 text-xl text-center rounded-2xl border-2"
              />
              <Button
                onClick={() => setScreen('step-city')}
                disabled={!formData.name.trim()}
                className="mt-8 h-16 text-xl font-bold bg-green-500 hover:bg-green-600 rounded-2xl"
              >
                Continuer
              </Button>
            </>
          )}

          {/* STEP: City */}
          {screen === 'step-city' && (
            <>
              <h2 className="text-2xl font-bold text-center mb-8">Dans quelle ville ?</h2>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ex: Dakar"
                className="h-16 text-xl text-center rounded-2xl border-2"
              />
              <Button
                onClick={() => setScreen('step-address')}
                disabled={!formData.city.trim()}
                className="mt-8 h-16 text-xl font-bold bg-green-500 hover:bg-green-600 rounded-2xl"
              >
                Continuer
              </Button>
            </>
          )}

          {/* STEP: Address */}
          {screen === 'step-address' && (
            <>
              <h2 className="text-2xl font-bold text-center mb-4">Votre adresse</h2>
              <p className="text-center text-gray-500 mb-6">Ex: en face de la gare, quartier Médina</p>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Décrivez votre localisation..."
                className="min-h-32 text-xl text-center rounded-2xl border-2"
              />
              <Button
                onClick={() => setScreen('step-whatsapp')}
                disabled={!formData.address.trim()}
                className="mt-8 h-16 text-xl font-bold bg-green-500 hover:bg-green-600 rounded-2xl"
              >
                Continuer
              </Button>
            </>
          )}

          {/* STEP: WhatsApp */}
          {screen === 'step-whatsapp' && (
            <>
              <h2 className="text-2xl font-bold text-center mb-4">Numéro WhatsApp</h2>
              <p className="text-center text-gray-500 mb-6">Avec indicatif pays (ex: +221)</p>
              <Input
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+221 77 123 45 67"
                className="h-16 text-xl text-center rounded-2xl border-2"
              />
              <Button
                onClick={createSite}
                disabled={!formData.whatsapp.trim()}
                className="mt-8 h-16 text-xl font-bold bg-green-500 hover:bg-green-600 rounded-2xl shadow-lg"
              >
                🚀 Créer mon site
              </Button>
            </>
          )}
        </div>

        {/* Click outside to close dropdown */}
        {showDropdown && (
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
        )}
      </div>
    );
  }

  // ============ LOADING SCREEN ============
  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <Loader2 className="w-20 h-20 text-green-500 animate-spin mb-8" />
        <h2 className="text-2xl font-bold text-center mb-4">Création de votre site...</h2>
        <p className="text-xl text-gray-500 text-center">Quelques secondes</p>
      </div>
    );
  }

  // ============ RESULT SCREEN ============
  if (screen === 'result' && createdClient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-400 to-green-600 flex flex-col items-center justify-center p-6">
        <div className="mb-8">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-8">🎉 Votre site est prêt !</h1>

        <Card className="w-full max-w-sm mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-2">Votre lien :</p>
            <div onClick={copyLink} className="text-xl font-bold text-green-600 cursor-pointer hover:underline flex items-center justify-center gap-2">
              {createdClient.slug}
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
            </div>
          </CardContent>
        </Card>

        <div className="w-full max-w-sm space-y-4">
          <Button onClick={() => window.open(`/${createdClient.slug}`, '_blank')} className="w-full h-16 text-xl font-bold bg-white text-green-600 hover:bg-gray-100 rounded-2xl shadow-lg">
            <ExternalLink className="w-6 h-6 mr-2" /> Voir mon site
          </Button>
          <Button onClick={() => setScreen('dashboard')} variant="outline" className="w-full h-16 text-xl font-bold bg-transparent text-white border-2 border-white rounded-2xl">
            <User className="w-6 h-6 mr-2" /> Mon espace
          </Button>
        </div>
      </div>
    );
  }

  // ============ DASHBOARD SCREEN ============
  if (screen === 'dashboard' && createdClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white p-6 border-b">
          <div className="flex items-center justify-between">
            <button onClick={() => setScreen('welcome')} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">👤 Mon Espace</h1>
            <div className="w-6" />
          </div>
        </div>

        <div className="flex-1 p-6 space-y-4">
          <Card className="bg-white">
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-2">👉 Votre site</h2>
              <a href={`/${createdClient.slug}`} target="_blank" rel="noopener noreferrer" className="text-green-600 font-bold text-xl hover:underline flex items-center">
                /{createdClient.slug}
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-2">👉 Abonnement</h2>
              <div className="text-2xl font-bold text-green-600">2 000 FCFA / mois</div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6 space-y-3">
              <Button onClick={() => setScreen('modification')} variant="outline" className="w-full h-14 text-lg font-medium rounded-xl justify-start">
                <Edit3 className="w-5 h-5 mr-3" /> Modifier mon site
              </Button>
              <Button onClick={() => window.open(`/${createdClient.slug}`, '_blank')} className="w-full h-14 text-lg font-medium rounded-xl bg-green-500 hover:bg-green-600 justify-start">
                <ExternalLink className="w-5 h-5 mr-3" /> Voir mon site
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ============ MODIFICATION SCREEN ============
  if (screen === 'modification') {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6">
        <div className="flex items-center mb-8">
          <button onClick={() => setScreen('dashboard')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold ml-4">✏️ Modifier mon site</h1>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-2xl font-bold text-center mb-4">Que voulez-vous changer ?</h2>
          <Textarea
            value={modificationRequest}
            onChange={(e) => setModificationRequest(e.target.value)}
            placeholder="Décrivez vos modifications..."
            className="min-h-40 text-xl rounded-2xl border-2"
          />
          <Button onClick={submitModification} disabled={!modificationRequest.trim()} className="mt-8 h-16 text-xl font-bold bg-green-500 hover:bg-green-600 rounded-2xl">
            Envoyer
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
