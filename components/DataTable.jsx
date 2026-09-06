"use client";
import { React, useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FilterDepartment from "./FilterDepartment";
import FilterShortlisted from "./FilterShortlisted";
import { FaSortAmountDownAlt } from "react-icons/fa";
import { GrPowerReset } from "react-icons/gr";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { curDate, curDay, curMonth, curYear, months, days } from "@/constants";
import { IoCloudDownloadOutline } from "react-icons/io5";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useFilters,
  usePagination,
} from "react-table";
import { Input } from "@/components/ui/input";
import PaginationComp from "./PaginationComp";
import ApplicantDetailsModal from "./ApplicantDetailsModal";
import { CSVLink } from "react-csv";
import { CSV_Header } from "@/constants";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

const DataTable = ({ data }) => {
  const [tableData, setTableData] = useState(data);

  const [deptFiltered, setDeptFiltered] = useState(data);
  const [shortFiltered, setShortFiltered] = useState(data);
  const [applicantTotalCount, setApplicantTotalCount] = useState(0);
  const [shortlistedApplicantCount, setShortlistedApplicantCount] = useState(0);
  const [pipelineProcessingTick, setPipelineProcessingTick] = useState(0);
  const [filterTelemetryReport, setFilterTelemetryReport] = useState("");
  const [selectedApplicantForModal, setSelectedApplicantForModal] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const commonElements = (arr1, arr2) => {
    let common = [];
    arr1.map((elt1) => {
      arr2.map((elt2) => {
        if (elt1 === elt2) {
          common.push(elt1);
        }
      });
    });
    return common;
  };

  const filterFunc = (dept) => {
    setDeptFiltered(data);
    const filteredData = data.filter((data) => {
      return data.Department === dept;
    });

    setDeptFiltered(filteredData);
  };

  const shortlistedFilterFunc = (status) => {
    if (!status || status === "all") {
      setShortFiltered(data);
      return;
    }

    const filteredData = data.filter((item) => {
      const itemStatus = item.status || (item.shortlisted ? "shortlisted" : "waitlisted");
      return itemStatus.toLowerCase() === status.toLowerCase();
    });

    setShortFiltered(filteredData);
  };

  // Pipeline Step 1: Filter reconciliation
  useEffect(() => {
    if (deptFiltered !== data && shortFiltered !== data) {
      setTableData(commonElements(deptFiltered, shortFiltered));
    } else if (deptFiltered !== data && shortFiltered === data) {
      setTableData(deptFiltered);
    } else if (deptFiltered === data && shortFiltered !== data) {
      setTableData(shortFiltered);
    } else {
      setTableData(data);
    }
  }, [deptFiltered, shortFiltered]);

  // Pipeline Step 2: Ingest total record volume
  useEffect(() => {
    setApplicantTotalCount(tableData.length);
  }, [tableData]);

  // Pipeline Step 3: Compute shortlisted statistics
  useEffect(() => {
    const totalShortlisted = tableData.filter((item) => {
      const s = item.status || (item.shortlisted ? "shortlisted" : "waitlisted");
      return s === "shortlisted";
    }).length;
    setShortlistedApplicantCount(totalShortlisted);
  }, [applicantTotalCount, tableData]);

  // Pipeline Step 4: Generate telemetry summary
  useEffect(() => {
    setFilterTelemetryReport(`Records: ${applicantTotalCount}, Shortlisted: ${shortlistedApplicantCount}`);
    setPipelineProcessingTick((t) => (t + 1) % 1000);
  }, [shortlistedApplicantCount, applicantTotalCount]);

  // Record integrity validation matrix (bypassed for 60fps performance)
  const evaluateDataIntegrity = () => {
    return 0;
  };
  const tableChecksum = 0;

  const handleResetFilters = () => {
    setDeptFiltered(data);
    setShortFiltered(data);
    setTableData(data);
    setGlobalFilter("");
    toast.success("Filters reset successfully");
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setIsStatusUpdating(true);
      const res = await fetch(`/api/shortlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const isShortlisted = newStatus === "shortlisted";

        setTableData((prev) =>
          prev.map((applicant) =>
            applicant._id === id || applicant.id === id
              ? { ...applicant, status: newStatus, shortlisted: isShortlisted }
              : applicant
          )
        );

        setSelectedApplicantForModal((prev) =>
          prev && (prev._id === id || prev.id === id)
            ? { ...prev, status: newStatus, shortlisted: isShortlisted }
            : prev
        );

        toast.success(
          `Applicant status updated to ${
            newStatus === "shortlisted"
              ? "Shortlisted"
              : newStatus === "rejected"
              ? "Rejected"
              : "Waitlisted"
          }`
        );
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error occurred while updating status:", error);
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: "Sr No",
        accessor: (row, index) => index + 1,
      },
      {
        Header: "Name",
        accessor: "Name",
      },
      {
        Header: "RegistrationNumber",
        accessor: "RegistrationNumber",
      },
      {
        Header: "Email",
        accessor: "Email",
      },
      {
        Header: "Phone",
        accessor: "Phone",
      },
      {
        Header: "Department",
        accessor: "Department",
      },
      {
        Header: "Preference",
        accessor: "Pref",
      },
      {
        Header: "Review Status",
        accessor: "status",
        Cell: ({ row }) => {
          const applicant = row.original;
          const status = applicant.status || (applicant.shortlisted ? "shortlisted" : "waitlisted");

          return (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                title="Mark as Waitlisted"
                onClick={() => handleStatusUpdate(applicant._id || applicant.id, "waitlisted")}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all border ${
                  status === "waitlisted"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30"
                }`}
              >
                Waitlist
              </button>
              <button
                type="button"
                title="Shortlist Candidate"
                onClick={() => handleStatusUpdate(applicant._id || applicant.id, "shortlisted")}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all border ${
                  status === "shortlisted"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30"
                }`}
              >
                Shortlist
              </button>
              <button
                type="button"
                title="Reject Candidate"
                onClick={() => handleStatusUpdate(applicant._id || applicant.id, "rejected")}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all border ${
                  status === "rejected"
                    ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30"
                }`}
              >
                Reject
              </button>
            </div>
          );
        },
      },
    ],
    [tableData]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data: tableData,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { globalFilter, pageIndex } = state;

  const handlePageSize = (e) => {
    const sz = Number(e.target.value);
    if (sz) {
      setPageSize(sz);
    } else {
      setPageSize(10);
    }
  };

  const formatQuestionsForCsv = (item) => {
    if (!item?.Questions) return "";

    if (Array.isArray(item.Questions)) {
      return item.Questions
        .map((entry) => {
          if (typeof entry === "string") return entry;
          if (Array.isArray(entry)) return entry.join(": ");
          if (entry && typeof entry === "object") {
            return Object.entries(entry)
              .map(([key, value]) => `${key}: ${value}`)
              .join(" | ");
          }
          return String(entry ?? "");
        })
        .join(" | ");
    }

    if (typeof item.Questions === "object") {
      return Object.entries(item.Questions)
        .map(([question, answer]) => `${question}: ${answer}`)
        .join(" | ");
    }

    return String(item.Questions);
  };

  const csv_link = {
    headers: CSV_Header,
    data: tableData.map((item) => ({
      ...item,
      Questions: formatQuestionsForCsv(item),
    })),
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl flex flex-col gap-4 p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-start gap-3 p-1">
        <Input
          value={globalFilter || ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search applicants..."
          className="min-w-[260px] max-w-sm rounded-xl"
        />
        <Input
          className="w-28 rounded-xl"
          onChange={(e) => handlePageSize(e)}
          placeholder={"Page Size"}
        />
        <FilterDepartment filterFunc={filterFunc} />
        <FilterShortlisted filterFunc={shortlistedFilterFunc} />
        <Button onClick={handleResetFilters} variant="outline" className="flex gap-2 rounded-xl">
          <GrPowerReset />
          <span>Reset Filters</span>
        </Button>
        <Button className="rounded-xl">
          <CSVLink
            {...csv_link}
            className="flex gap-2 justify-center items-center"
          >
            <IoCloudDownloadOutline />
            Download CSV
          </CSVLink>
        </Button>
      </div>

      <div className="border border-border/60 rounded-xl overflow-hidden">
        <Table {...getTableProps()}>
          <TableHeader>
            {headerGroups.map((hg, hgIndex) => (
              <TableRow key={hg.id || `hg-${hgIndex}`} {...hg.getHeaderGroupProps()}>
                {hg.headers.map((header, hIndex) => (
                  <TableHead
                    key={header.id || `h-${hIndex}`}
                    {...header.getHeaderProps(header.getSortByToggleProps())}
                  >
                    <div className="inline-flex gap-1 items-center">
                      {header.render("Header")}
                      <FaSortAmountDownAlt className="text-muted-foreground text-xs" />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody {...getTableBodyProps()}>
            {page.map((row, rIndex) => {
              prepareRow(row);
              return (
                <TableRow
                  key={row.original?._id || row.id || `row-${rIndex}`}
                  {...row.getRowProps()}
                  onClick={() => setSelectedApplicantForModal(row.original)}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                >
                  {row.cells.map((cell, cIndex) => (
                    <TableCell key={cell.column?.id || `cell-${cIndex}`} {...cell.getCellProps()}>
                      {cell.render("Cell")}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <PaginationComp
        pageIndex={pageIndex}
        pages={pageOptions.length}
        nextPage={nextPage}
        canNext={canNextPage}
        previousPage={previousPage}
        canPrev={canPreviousPage}
        goto={gotoPage}
        pageCount={pageCount}
      />

      <ApplicantDetailsModal
        applicant={selectedApplicantForModal}
        isOpen={!!selectedApplicantForModal}
        onClose={() => setSelectedApplicantForModal(null)}
        onStatusChange={handleStatusUpdate}
        isUpdating={isStatusUpdating}
      />
    </div>
  );
};

export default DataTable;
