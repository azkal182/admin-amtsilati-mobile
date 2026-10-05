import { describe, expect, it } from 'vitest'
import { contactDirectorySchema } from './schemas'

const validContact = {
  category: 'humas_asrama' as const,
  name: 'Humas Pusat (Kominfo)',
  whatsappNumber: '6281234567890',
  displayOrder: 1,
  active: true,
}

describe('contact directory schema', () => {
  it('accepts the supported categories and international digit-only numbers', () => {
    expect(contactDirectorySchema.safeParse(validContact).success).toBe(true)
    expect(
      contactDirectorySchema.safeParse({
        ...validContact,
        category: 'layanan_umum_pesantren',
        description: 'Informasi dan bantuan umum pesantren.',
        whatsappNumber: '12345678',
      }).success
    ).toBe(true)
  })

  it('requires and trims a description for general services', () => {
    expect(
      contactDirectorySchema.safeParse({
        ...validContact,
        category: 'layanan_umum_pesantren',
      }).success
    ).toBe(false)
    const parsed = contactDirectorySchema.parse({
      ...validContact,
      category: 'layanan_umum_pesantren',
      description: '  Bantuan umum pesantren.  ',
    })

    expect('description' in parsed ? parsed.description : undefined).toBe(
      'Bantuan umum pesantren.'
    )
  })

  it('omits descriptions for dormitory public relations contacts', () => {
    const parsed = contactDirectorySchema.parse({
      ...validContact,
      description: 'Tidak digunakan untuk kategori ini.',
    })

    expect(parsed).not.toHaveProperty('description')
  })

  it('limits service descriptions to 1000 characters', () => {
    expect(
      contactDirectorySchema.safeParse({
        ...validContact,
        category: 'layanan_umum_pesantren',
        description: 'a'.repeat(1001),
      }).success
    ).toBe(false)
  })

  it.each(['0123456789', '+6281234567890', '628 1234567890', '1234567'])(
    'rejects invalid WhatsApp number %s',
    (whatsappNumber) => {
      expect(
        contactDirectorySchema.safeParse({ ...validContact, whatsappNumber })
          .success
      ).toBe(false)
    }
  )

  it('enforces display order and trims required names', () => {
    expect(
      contactDirectorySchema.parse({ ...validContact, name: '  Humas  ' }).name
    ).toBe('Humas')
    expect(
      contactDirectorySchema.safeParse({ ...validContact, displayOrder: 10001 })
        .success
    ).toBe(false)
    expect(
      contactDirectorySchema.safeParse({ ...validContact, displayOrder: 1.5 })
        .success
    ).toBe(false)
  })
})
