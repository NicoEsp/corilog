import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";

interface MomentsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
}

export function MomentsPagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalCount 
}: MomentsPaginationProps) {
  const isMobile = useIsMobile();

  if (totalPages <= 1) return null;

  const handlePageClick = (page: number) => {
    onPageChange(page);
    // Scroll to top smoothly when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const delta = isMobile ? 1 : 2; // Show fewer pages on mobile
    const range = [];
    const rangeWithDots = [];

    // Calculate range around current page
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Add first page if not in range
    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) {
        rangeWithDots.push('ellipsis-start');
      }
    }

    // Add main range
    rangeWithDots.push(...range);

    // Add last page if not in range
    if (end < totalPages) {
      if (end < totalPages - 1) {
        rangeWithDots.push('ellipsis-end');
      }
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="mt-8 space-y-4">
      {/* Page info */}
      <div className="text-center text-sm text-muted-foreground">
        Página {currentPage} de {totalPages} • {totalCount} momento{totalCount !== 1 ? 's' : ''} total{totalCount !== 1 ? 'es' : ''}
      </div>

      {/* Pagination controls */}
      <Pagination>
        <PaginationContent>
          {/* Previous button */}
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 && handlePageClick(currentPage - 1)}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {/* Page numbers */}
          {getPageNumbers().map((pageNumber, index) => (
            <PaginationItem key={index}>
              {pageNumber === 'ellipsis-start' || pageNumber === 'ellipsis-end' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => handlePageClick(pageNumber as number)}
                  isActive={pageNumber === currentPage}
                  className="cursor-pointer"
                >
                  {pageNumber}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next button */}
          <PaginationItem>
            <PaginationNext 
              onClick={() => currentPage < totalPages && handlePageClick(currentPage + 1)}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}