/**
 * IASN Continuous Worker - tourne en boucle et génère les sites immédiatement
 * 
 * Ce script tourne en permanence et vérifie Supabase toutes les 15 secondes.
 * Dès qu'un nouveau client est détecté, il génère le site avec l'IA.
 * 
 * Usage:
 *   nohup bun worker/worker-loop.sh > worker/worker.log 2>&1 &
 */

while true; do
  MAX_CLIENTS=1 bun worker/generate-sites.ts
  sleep 15
done
