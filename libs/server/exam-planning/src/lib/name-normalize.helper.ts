// Helper condivisi per l'unicità "umana" dei nomi.
// Un vincolo UNIQUE di Postgres confronta i byte esatti: è quindi sensibile sia
// alle maiuscole sia agli spazi. Per evitare doppioni come "Programmazione Web"
// vs "programmazione  web " usiamo questi due strumenti nei service.

/**
 * Normalizza un nome per il SALVATAGGIO:
 * - rimuove spazi iniziali/finali (trim)
 * - riduce ogni sequenza di spazi interni a un singolo spazio
 * Due nomi che differiscono solo per spazi diventano così identici sul DB.
 */
export function normalizeName(name: string): string {
    return name.trim().replace(/\s+/g, ' ');
}

/**
 * Chiave di confronto case-insensitive: normalizza gli spazi e abbassa il case.
 * Due nomi con la stessa chiave sono considerati duplicati anche se differiscono
 * solo per maiuscole/minuscole o per spazi.
 */
export function nameKey(name: string): string {
    return normalizeName(name).toLowerCase();
}
