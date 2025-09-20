import { useEffect, useRef, useState } from 'react'

export const useScrollAnimation = (threshold = 0.1, rootMargin = '0px') => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Once visible, we can stop observing
          observer.unobserve(entry.target)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold, rootMargin])

  return [ref, isVisible]
}

export const useStaggeredAnimation = (items = [], delay = 100) => {
  const [visibleItems, setVisibleItems] = useState(new Set())
  const refs = useRef([])

  useEffect(() => {
    const observers = []

    refs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                setVisibleItems(prev => new Set([...prev, index]))
              }, index * delay)
              observer.unobserve(entry.target)
            }
          },
          { threshold: 0.1 }
        )
        observer.observe(ref)
        observers.push(observer)
      }
    })

    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [items.length, delay])

  const setRef = (index) => (el) => {
    refs.current[index] = el
  }

  return [setRef, visibleItems]
}
