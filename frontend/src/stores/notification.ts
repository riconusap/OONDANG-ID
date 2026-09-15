import { defineStore } from 'pinia'
import { ref, h } from 'vue'
import { toast, type ToastOptions } from 'vue3-toastify'

export interface ErrorModalState {
  isOpen: boolean
  title: string
  message: string
}

export const useNotificationStore = defineStore('notification', () => {
  const errorModal = ref<ErrorModalState>({
    isOpen: false,
    title: '',
    message: '',
  })

  function showToast(message: string, title: string = 'Berhasil', duration: number = 3500) {
    toast.success(
      () =>
        h('div', { class: 'flex flex-col gap-0.5 text-left' }, [
          title ? h('span', { class: 'font-bold text-xs text-ink' }, title) : null,
          h('span', { class: 'text-xs text-ink-muted leading-relaxed' }, message),
        ]),
      {
        autoClose: duration,
        position: toast.POSITION.TOP_RIGHT,
        theme: toast.THEME.LIGHT,
      } as ToastOptions
    )
  }

  function showError(message: string, title: string = 'Terjadi Kesalahan') {
    errorModal.value = {
      isOpen: true,
      title,
      message,
    }
  }

  function closeError() {
    errorModal.value.isOpen = false
  }

  return {
    errorModal,
    showToast,
    showError,
    closeError,
  }
})
