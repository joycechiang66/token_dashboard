import { computed, ref, onMounted, onUnmounted } from 'vue'

export function useChartTheme() {
  const isDark = ref(false)

  function checkDark() {
    isDark.value = document.documentElement.classList.contains('dark')
  }

  let observer: MutationObserver | null = null

  onMounted(() => {
    checkDark()
    observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  const gridColor = computed(() =>
    isDark.value ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
  )

  const textColor = computed(() =>
    isDark.value ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
  )

  const tooltipBg = computed(() =>
    isDark.value ? 'rgba(30, 30, 40, 0.95)' : 'rgba(0, 0, 0, 0.8)'
  )

  return {
    isDark,
    gridColor,
    textColor,
    tooltipBg,
  }
}
