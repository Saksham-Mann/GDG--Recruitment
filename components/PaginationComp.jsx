"use client";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { HiOutlineChevronDoubleLeft } from "react-icons/hi";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";

const PaginationComp = ({
  pageIndex,
  pages,
  nextPage,
  canNext,
  previousPage,
  canPrev,
  goto,
  pageCount,
}) => {
  let pageNum = [];
  for (let i = 1; i <= pageCount; i++) {
    pageNum.push(i);
  }
  let dispPageNum = [];
  dispPageNum.push(pageNum[pageIndex]);
  dispPageNum.push(pageNum[pageIndex + 1]);
  dispPageNum.push(pageNum[pageIndex + 2]);

  dispPageNum = dispPageNum.filter((pg) => pg !== undefined);

  return (
    <div className="flex items-center justify-between p-5 pt-0">
      <div className="w-full text-sm p-3">
        Page {pageIndex + 1} of {pages}
      </div>
      <Pagination>
        <PaginationContent className="cursor-pointer select-none">
          <PaginationItem
            className={!canPrev ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:text-foreground"}
            aria-disabled={!canPrev}
            onClick={() => canPrev && goto(0)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-xs">
              <HiOutlineChevronDoubleLeft className="h-4 w-4" />
            </span>
          </PaginationItem>
          <PaginationItem
            className={!canPrev ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
            aria-disabled={!canPrev}
          >
            <PaginationPrevious onClick={() => canPrev && previousPage()} />
          </PaginationItem>
          {dispPageNum.map((num) => (
            <PaginationItem key={num}>
              {pageIndex + 1 === num ? (
                <PaginationLink
                  key={num}
                  isActive
                  onClick={() => goto(num - 1)}
                >
                  {num}
                </PaginationLink>
              ) : (
                <PaginationLink key={num} onClick={() => goto(num - 1)}>
                  {num}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem
            className={!canNext ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
            aria-disabled={!canNext}
          >
            <PaginationNext onClick={() => canNext && nextPage()} />
          </PaginationItem>
          <PaginationItem
            className={!canNext ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:text-foreground"}
            aria-disabled={!canNext}
            onClick={() => canNext && goto(pageCount - 1)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-xs">
              <HiOutlineChevronDoubleRight className="h-4 w-4" />
            </span>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationComp;
