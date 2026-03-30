'use client';

import { useState } from "react";
import Link from "next/link";

export default function NouveauChantier() {
  return (
    <div className="p-8">
      <Link href="/dashboard/btp/chantiers">Retour</Link>
      <h1>Nouveau Chantier - Page en développement</h1>
      <p>Formulaire de création à implémenter.</p>
    </div>
  );
}
