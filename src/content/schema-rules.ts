// Pure predicates behind the Sanity publish gates, extracted so the CRITICAL
// rules are unit-tested independently of Sanity's Rule builder (spec §2.2).

export interface Contact { phone?: string; email?: string }

/** A job needs a resolvable customer contact (phone OR email) to publish. */
export function hasResolvableContact(contact: Contact | undefined | null): boolean {
  return Boolean(contact && ((contact.phone?.trim() ?? '') !== '' || (contact.email?.trim() ?? '') !== ''));
}

export interface HistoricOverlay { applies?: boolean; details?: string }

/** Details are required only when an overlay applies (a no-overlay town can publish). */
export function historicOverlayError(overlay: HistoricOverlay | undefined | null): string | true {
  if (overlay?.applies && (overlay.details?.trim() ?? '') === '') {
    return 'Details are required when an overlay applies';
  }
  return true;
}
