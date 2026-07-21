import type { UserRole } from '../types/curriculum';

export const roleLabels: Record<UserRole, string> = {
 insegnante: 'Insegnante / Docente',
 dipartimento: 'Coordinatore Dipartimento',
 referente: 'Referente per il Curricolo',
 dirigente: 'Dirigente Scolastico',
 collegio: 'Collegio dei Docenti',
 amministratore: 'Revisore Tecnico / Amministratore'
};

export const getRoleLabel = (role: UserRole): string => {
 return roleLabels[role] || role;
};