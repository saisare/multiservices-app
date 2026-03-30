'use client';  // Important pour les animations

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Globe, Users, Shield, Plane, FileText, Truck } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    // Animation en 5 étapes sur 5 secondes
    const steps = [0, 1, 2, 3, 4];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setAnimationStep(step);
      }, index * 1000); // 1 seconde entre chaque étape
    });

    // Après 5 secondes, aller à la page login
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center text-white overflow-hidden">

      {/* Logo principal avec animations */}
      <div className="relative mb-12">
        {/* Bâtiment principal */}
        <Building2
          className={`w-32 h-32 transition-all duration-1000 ${
            animationStep >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        />

        {/* Globe qui tourne */}
        <Globe
          className={`absolute -top-4 -right-4 w-16 h-16 text-blue-300 transition-all duration-1000 ${
            animationStep >= 1 ? 'opacity-100 animate-spin-slow' : 'opacity-0'
          }`}
        />

        {/* Utilisateurs qui bougent */}
        <Users
          className={`absolute -bottom-4 -left-4 w-12 h-12 text-green-300 transition-all duration-1000 ${
            animationStep >= 2 ? 'opacity-100 animate-bounce' : 'opacity-0'
          }`}
        />

        {/* Bouclier sécurité */}
        <Shield
          className={`absolute top-1/2 -right-6 w-10 h-10 text-yellow-300 transition-all duration-1000 ${
            animationStep >= 3 ? 'opacity-100 animate-pulse' : 'opacity-0'
          }`}
        />
      </div>

      {/* Nom de l'entreprise */}
      <h1 className={`text-5xl font-bold mb-4 text-center transition-all duration-1000 ${
        animationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        SGT ENTERPRISE
      </h1>

      {/* Définition du logiciel */}
      <p className={`text-lg text-gray-200 mb-2 transition-all duration-1000 delay-200 ${
        animationStep >= 1 ? 'opacity-100' : 'opacity-0'
      }`}>
        Task Management Service for Enterprises
      </p>

      {/* Slogan */}
      <p className={`text-xl text-gray-300 mb-8 transition-all duration-1000 delay-300 ${
        animationStep >= 2 ? 'opacity-100' : 'opacity-0'
      }`}>
        Excellence in Enterprise Task Management
      </p>

      {/* Icônes des services */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {[
          { icon: Plane, label: 'Voyage', color: 'text-blue-400', delay: 0 },
          { icon: FileText, label: 'Immigration', color: 'text-green-400', delay: 100 },
          { icon: Shield, label: 'Assurance', color: 'text-yellow-400', delay: 200 },
          { icon: Truck, label: 'Logistique', color: 'text-red-400', delay: 300 },
          { icon: Globe, label: 'Communication', color: 'text-purple-400', delay: 400 },
          { icon: Users, label: 'RH', color: 'text-pink-400', delay: 500 },
          { icon: Building2, label: 'BTP', color: 'text-orange-400', delay: 600 },
        ].map((service, index) => (
          <div
            key={service.label}
            className={`flex flex-col items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-500 ${
              animationStep >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            }`}
            style={{ transitionDelay: `${service.delay}ms` }}
          >
            <service.icon className={`w-8 h-8 ${service.color} mb-2`} />
            <span className="text-sm">{service.label}</span>
          </div>
        ))}
      </div>

      {/* Barre de progression */}
      <div className="w-80 bg-white/20 rounded-full h-2 mb-4 overflow-hidden">
        <div
          className="bg-white h-full rounded-full transition-all duration-4500 ease-linear"
          style={{ width: `${(animationStep + 1) * 20}%` }}
        />
      </div>

      {/* Message */}
      <p className={`text-gray-400 transition-all duration-1000 ${
        animationStep >= 4 ? 'opacity-100' : 'opacity-0'
      }`}>
        Chargement de l'application...
      </p>

    </div>
  );
}
