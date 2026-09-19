import { onMounted, onUnmounted, ref, type Ref } from 'vue';

export function useIntersectionObserver(
  target: Ref<HTMLElement | null>,
  options: IntersectionObserverInit = { threshold: 0.15 }
) {
  const isIntersecting = ref(false);

  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        isIntersecting.value = true;
        // Optionally unobserve once visible
        if (target.value) {
            observer?.unobserve(target.value);
        }
      }
    }, options);

    if (target.value) {
      observer.observe(target.value);
    }
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  return { isIntersecting };
}
