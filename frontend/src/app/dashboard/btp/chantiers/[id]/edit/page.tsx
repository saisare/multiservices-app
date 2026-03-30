'use client';

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditChantier() {
  const params = useParams();
  const id = params.id;
  return (
    <div className="p-8">
      <Link href={`/dashboard/btp/chantiers/${id}`}>Retour</Link>
      <h1>Éditer Chantier {id} - Page en développement</h1>
      <p>Formulaire d'édition à implémenter.</p>
    </div>
  );
}
