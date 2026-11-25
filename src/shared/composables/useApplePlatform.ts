import { onMounted, readonly, shallowRef } from 'vue'
import { isApplePlatform } from '../utils/isApplePlatform'

/** Tell whether the user is on macOS or iOS, once mounted, so the server render and the first client render agree. */
export function useApplePlatform() {
  const usesApplePlatform = shallowRef(false)

  onMounted(() => {
    usesApplePlatform.value = isApplePlatform()
  })

  return readonly(usesApplePlatform)
}
