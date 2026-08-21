import { useState, useEffect } from "react";

export function usePagination(data, itemsPerPage = 12) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const currentData = () => {
    const safePage = Math.min(currentPage, Math.max(1, totalPages));
    const begin = (safePage - 1) * itemsPerPage;
    const end = begin + itemsPerPage;
    return (data || []).slice(begin, end);
  };

  const next = () => {
    setCurrentPage((current) => Math.min(current + 1, totalPages));
  };

  const prev = () => {
    setCurrentPage((current) => Math.max(current - 1, 1));
  };

  const jump = (page) => {
    const pageNumber = Math.max(1, page);
    setCurrentPage(Math.min(pageNumber, totalPages));
  };

  return {
    next,
    prev,
    jump,
    currentData,
    currentPage: Math.min(currentPage, Math.max(1, totalPages)),
    totalPages,
  };
}
