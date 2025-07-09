// UUID utility for React Native compatibility
// Generates proper UUIDs for database compatibility

/**
 * Generate a UUID v4 compatible with React Native and PostgreSQL
 * Returns format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate avatar ID with proper UUID format
 * @param userId - User ID for reference
 * @returns Proper UUID for avatar record
 */
export function generateAvatarId(userId?: string): string {
  return generateUUID();
}

/**
 * Validate if a string is a proper UUID format
 * @param uuid - String to validate
 * @returns true if valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use generateAvatarId() instead
 */
export function generateLegacyAvatarId(userId: string): string {
  return `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 