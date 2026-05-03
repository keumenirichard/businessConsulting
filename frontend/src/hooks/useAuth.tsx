import { useAuth } from '../context/AuthContext';

// Hiérarchie des rôles : plus l'index est élevé, plus le rôle est puissant
const HIERARCHIE_ROLES = [
  'technicien',
  'commercial',
  'resp_stocks',
  'resp_technique',
  'directeur',
  'admin',
];

export function usePermissions() {
  const { role } = useAuth();

  // Niveau du rôle actuel dans la hiérarchie
  const niveauActuel = HIERARCHIE_ROLES.indexOf(role || '');

  // Vérifie si l'utilisateur courant peut agir sur un utilisateur cible
  const peutGererUtilisateur = (roleCible: string): boolean => {
    const niveauCible = HIERARCHIE_ROLES.indexOf(roleCible);
    // On ne peut gérer que des rôles strictement inférieurs au sien
    return niveauActuel > niveauCible;
  };

  // Vérifie si l'utilisateur a au moins un rôle donné
  const aAuMoinsRole = (roleRequis: string): boolean => {
    return niveauActuel >= HIERARCHIE_ROLES.indexOf(roleRequis);
  };

  return {
    role,
    peutGererUtilisateur,
    aAuMoinsRole,
    estAdmin:         role === 'admin',
    estDirecteur:     role === 'directeur' || role === 'admin',
    estRespTechnique: ['resp_technique', 'directeur', 'admin'].includes(role || ''),
    estCommercial:    ['commercial', 'directeur', 'admin'].includes(role || ''),
    estRespStocks:    ['resp_stocks', 'directeur', 'admin'].includes(role || ''),
    estTechnicien:    role === 'technicien',
  };
}