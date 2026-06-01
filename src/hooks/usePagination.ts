import { ref } from 'vue'

// 全局统一分页配置
export const GLOBAL_PAGE_SIZE = 10
export const GLOBAL_PAGE_SIZES = [10, 20, 50, 100]

export function usePagination(defaultPageSize = GLOBAL_PAGE_SIZE) {
  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)
  const pageSizes = ref(GLOBAL_PAGE_SIZES)

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
    pageSizes,
    handleSizeChange,
    handleCurrentChange,
    resetPagination,
    getPaginatedList
  }
}

