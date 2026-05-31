import { ref } from 'vue'

export function usePagination(defaultPageSize = 10) {
  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)

  const handleSizeChange = (val: number) => {
    pageSize.value = val
    currentPage.value = 1
  }

  const handleCurrentChange = (val: number) => {
    currentPage.value = val
  }

  const resetPagination = () => {
    currentPage.value = 1
  }

  const getPaginatedList = <T>(list: T[]) => {
    const start = (currentPage.value - 1) * pageSize.value
    return list.slice(start, start + pageSize.value)
  }

  return {
    currentPage,
    pageSize,
    handleSizeChange,
    handleCurrentChange,
    resetPagination,
    getPaginatedList
  }
}
