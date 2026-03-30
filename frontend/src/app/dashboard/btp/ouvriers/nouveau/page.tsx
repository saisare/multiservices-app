'use client';

import { useState } from "react";
import Link from "next/link";
import { btpApi, Ouvrier } from "@/services/api/btp.api";
import { User, HardHat, Phone, Mail, Calendar, DollarSign, Save, ArrowLeft, AlertCircle } from "lucide-react";

export default function NouveauOuvrier() {
  const [formData, setFormData] = useState<Ouvrier>({
    id: 0,
    prenom: '',
    nom: '',
    metier: '',
    matricule: '',
    telephone: '',
    email: '',
    date_embauche: '',
    salaire_journalier: 0,
    adresse: '',
    actif: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await btpApi.createOuvrier(formData);
      // Redirect or success
    } catch (err) {
      setError('Erreur création');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/btp/ouvriers">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Nouvel ouvrier</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Prénom</label>
            <input name="prenom" value={formData.prenom} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label>Nom</label>
            <input name="nom" value={formData.nom} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
        </div>
        <div>
          <label>Métier</label>
          <input name="metier" value={formData.metier} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label>Matricule</label>
          <input name="matricule" value={formData.matricule} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Téléphone</label>
            <input name="telephone" value={formData.telephone} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label>Email</label>
            <input name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>
        <div>
          <label>Date embauche</label>
          <input type="date" name="date_embauche" value={formData.date_embauche} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Salaire journalier</label>
            <input type="number" name="salaire_journalier" value={formData.salaire_journalier} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label>Adresse</label>
            <input name="adresse" value={formData.adresse} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded">
          {loading ? 'Création...' : 'Créer ouvrier'}
        </button>
        {error && <div className="bg-red-100 p-2 rounded text-red-700">{error}</div>}
      </form>
    </div>
  );
}
