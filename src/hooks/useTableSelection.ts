import { ref, computed, type Ref, type ComputedRef } from 'vue'

export function useTableSelection<T>(
  getRowId: (row: T) => string = (row: any) => row.id || row.user_id
) {
  const selectedIds = ref<string[]>([])

  const toggleSelect = (id: string, val: boolean) => {
    if (val) {
      if (!selectedIds.value.includes(id)) {
        selectedIds.value = [...selectedIds.value, id]
      }
    } else {
      selectedIds.value = selectedIds.value.filter(x => x !== id)
    }
  }

  const clearSelection = () => {
    selectedIds.value = []
  }

  const getSelectionHandlers = (currentPageItemsRef: Ref<T[]> | ComputedRef<T[]> | (() => T[])) => {
    const getItems = () => {
      if (typeof currentPageItemsRef === 'function') {
        return currentPageItemsRef()
      }
      return currentPageItemsRef.value
    }

    const isCurrentPageAllSelected = computed(() => {
      const items = getItems()
      return (
        items.length > 0 &&
        items.every((r) => selectedIds.value.includes(getRowId(r)))
      )
    })

    const isCurrentPageIndeterminate = computed(() => {
      const items = getItems()
      return (
        items.some((r) => selectedIds.value.includes(getRowId(r))) &&
        !isCurrentPageAllSelected.value
      )
    })

    const handleSelectCurrentPage = (val: boolean) => {
      const items = getItems()
      const pageIds = items.map(getRowId)
      if (val) {
        const merged = new Set([...selectedIds.value, ...pageIds])
        selectedIds.value = [...merged]
      } else {
        selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id))
      }
    }

    return {
      isCurrentPageAllSelected,
      isCurrentPageIndeterminate,
      handleSelectCurrentPage
    }
  }

  return {
    selectedIds,
    toggleSelect,
    clearSelection,
    getSelectionHandlers
  }
}
