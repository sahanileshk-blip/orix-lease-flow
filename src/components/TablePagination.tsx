import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function usePagination<T>(items: T[], initialPageSize: number = 5) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Ensure current page is valid if items decrease or page size changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedItems,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
  };
}

interface TablePaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  startIndex: number;
  endIndex: number;
}

export function TablePagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  startIndex,
  endIndex,
}: TablePaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t bg-muted/5">
      <div className="text-xs text-muted-foreground order-2 sm:order-1">
        Showing <span className="font-medium text-foreground">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
        <span className="font-medium text-foreground">{endIndex}</span> of{" "}
        <span className="font-medium text-foreground">{totalItems}</span> entries
      </div>
      
      <div className="flex items-center gap-4 sm:gap-8 order-1 sm:order-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={(val) => {
            onPageSizeChange(Number(val));
            onPageChange(1); // Reset to first page when size changes
          }}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="25">25</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Pagination className="w-auto mx-0">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <button
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="flex h-8 items-center justify-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50 disabled:pointer-events-none border border-input bg-background"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
            </PaginationItem>
            
            <div className="flex items-center px-2 text-xs font-medium">
              Page {currentPage} of {totalPages || 1}
            </div>

            <PaginationItem>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="flex h-8 items-center justify-center gap-1 rounded-md px-2.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50 disabled:pointer-events-none border border-input bg-background"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
