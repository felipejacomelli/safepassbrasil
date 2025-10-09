import { occurrenceFormSchema, validateOccurrence, validateUF, validateDateTime } from '@/lib/schemas/occurrence'

describe('Occurrence Schema', () => {
  describe('occurrenceFormSchema', () => {
    it('should validate valid occurrence data', () => {
      const validData = {
        start_at: '2024-12-31T10:00',
        end_at: '2024-12-31T12:00',
        uf: 'SP',
        state: 'São Paulo',
        city: 'São Paulo'
      }

      const result = occurrenceFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid UF', () => {
      const invalidData = {
        start_at: '2024-12-31T10:00',
        end_at: '2024-12-31T12:00',
        uf: 'XX',
        state: 'São Paulo',
        city: 'São Paulo'
      }

      const result = occurrenceFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject past dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      const invalidData = {
        start_at: pastDate.toISOString().slice(0, 16),
        end_at: '2024-12-31T12:00',
        uf: 'SP',
        state: 'São Paulo',
        city: 'São Paulo'
      }

      const result = occurrenceFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject end date before start date', () => {
      const invalidData = {
        start_at: '2024-12-31T12:00',
        end_at: '2024-12-31T10:00',
        uf: 'SP',
        state: 'São Paulo',
        city: 'São Paulo'
      }

      const result = occurrenceFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('validateUF', () => {
    it('should validate correct UFs', () => {
      expect(validateUF('SP')).toBe(true)
      expect(validateUF('RJ')).toBe(true)
      expect(validateUF('MG')).toBe(true)
    })

    it('should reject invalid UFs', () => {
      expect(validateUF('XX')).toBe(false)
      expect(validateUF('sp')).toBe(false)
      expect(validateUF('S')).toBe(false)
      expect(validateUF('SPP')).toBe(false)
    })
  })

  describe('validateDateTime', () => {
    it('should validate future dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      
      expect(validateDateTime(futureDate.toISOString().slice(0, 16))).toBe(true)
    })

    it('should reject past dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      
      expect(validateDateTime(pastDate.toISOString().slice(0, 16))).toBe(false)
    })

    it('should reject invalid date format', () => {
      expect(validateDateTime('invalid-date')).toBe(false)
      expect(validateDateTime('')).toBe(false)
    })
  })

  describe('validateOccurrence', () => {
    it('should return success for valid data', () => {
      const validData = {
        start_at: '2024-12-31T10:00',
        end_at: '2024-12-31T12:00',
        uf: 'SP',
        state: 'São Paulo',
        city: 'São Paulo'
      }

      const result = validateOccurrence(validData)
      expect(result.success).toBe(true)
    })

    it('should return errors for invalid data', () => {
      const invalidData = {
        start_at: '',
        end_at: '',
        uf: 'XX',
        state: '',
        city: ''
      }

      const result = validateOccurrence(invalidData)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
    })
  })
})







