import { renderHook, act } from '@testing-library/react'
import { useOccurrences } from '@/hooks/use-occurrences'

describe('useOccurrences', () => {
  it('should initialize with default occurrence', () => {
    const { result } = renderHook(() => useOccurrences())
    
    expect(result.current.occurrences).toHaveLength(1)
    expect(result.current.occurrences[0]).toEqual({
      start_at: '',
      end_at: '',
      uf: '',
      state: '',
      city: ''
    })
  })

  it('should add new occurrence', () => {
    const { result } = renderHook(() => useOccurrences())
    
    act(() => {
      result.current.addOccurrence()
    })
    
    expect(result.current.occurrences).toHaveLength(2)
  })

  it('should remove occurrence when more than one exists', () => {
    const { result } = renderHook(() => useOccurrences())
    
    act(() => {
      result.current.addOccurrence()
      result.current.addOccurrence()
    })
    
    expect(result.current.occurrences).toHaveLength(3)
    
    act(() => {
      result.current.removeOccurrence(1)
    })
    
    expect(result.current.occurrences).toHaveLength(2)
  })

  it('should not remove occurrence when only one exists', () => {
    const { result } = renderHook(() => useOccurrences())
    
    act(() => {
      result.current.removeOccurrence(0)
    })
    
    expect(result.current.occurrences).toHaveLength(1)
  })

  it('should update occurrence field', () => {
    const { result } = renderHook(() => useOccurrences())
    
    act(() => {
      result.current.updateOccurrence(0, 'city', 'São Paulo')
    })
    
    expect(result.current.occurrences[0].city).toBe('São Paulo')
  })

  it('should reset form', () => {
    const { result } = renderHook(() => useOccurrences())
    
    act(() => {
      result.current.addOccurrence()
      result.current.updateOccurrence(0, 'city', 'São Paulo')
    })
    
    expect(result.current.occurrences).toHaveLength(2)
    expect(result.current.occurrences[0].city).toBe('São Paulo')
    
    act(() => {
      result.current.resetForm()
    })
    
    expect(result.current.occurrences).toHaveLength(1)
    expect(result.current.occurrences[0].city).toBe('')
  })

  it('should clear errors', () => {
    const { result } = renderHook(() => useOccurrences())
    
    act(() => {
      result.current.clearErrors()
    })
    
    expect(result.current.hasErrors()).toBe(false)
  })
})

