import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

/**
 * Hashes a password using scrypt.
 * @param password The plain text password.
 * @returns A promise that resolves to the hashed password in "salt.hash" format (hex).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}.${derivedKey.toString('hex')}`
}

/**
 * Verifies a password against a hash.
 * @param password The plain text password.
 * @param storedHash The hashed password in "salt.hash" format.
 * @returns A promise that resolves to true if the password matches, false otherwise.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split('.')
  if (!salt || !hash) return false

  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
  const hashBuffer = Buffer.from(hash, 'hex')

  return timingSafeEqual(derivedKey, hashBuffer)
}

/**
 * Generates a random secure token.
 * @returns A random hex string.
 */
export function generateToken(): string {
  return randomBytes(32).toString('hex')
}
