"use client";

import type { PageInfo } from "@/app/api/advocates/route";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Advocate } from "@/db/schema";
import { formatPhoneNumber } from "@/lib/phone/utils";
import { useAdvocateSearch } from "@/lib/use_advocate_search";
import { ChangeEvent, useEffect, useState } from "react";

export default function Home() {
  const {
    advocates,
    error,
    loading,
    pageInfo,
    search,
    searchTerm,
    setPageNumber,
    setPageSize,
    setYearsOfExperience,
    yearsOfExperince,
  } = useAdvocateSearch();

  const onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    search(value);
    setPageNumber(1);
  };

  const onClick = () => {
    search("");
    setPageNumber(1);
  };

  function setYearsOfExperienceFilter({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) {
    if (value !== "" && isNaN(parseInt(value))) {
      return;
    }

    setYearsOfExperience(+value);
  }

  return (
    <main className="container mx-auto grid h-screen grid-rows-[auto_auto_1fr_auto] p-6">
      <h1 className="mb-16 font-sans text-3xl font-extralight tracking-widest">
        Solace Advocates
      </h1>
      <div className="space-y-2">
        <label htmlFor="search" className="cursor-pointer">
          <h2 className="text-xl font-bold">Search</h2>
        </label>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input id="search" value={searchTerm} onChange={onChange} />
            <Button onClick={onClick}>Reset Search</Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Sort by: </span>
            <Button className="ml-auto opacity-60" disabled>
              {/** TODO: do custom ordering */}
              Best Match
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span>Min YOE:</span>
            <Input
              type="number"
              onChange={setYearsOfExperienceFilter}
              step={1}
              value={yearsOfExperince}
            />
          </div>
        </div>
        {searchTerm && (
          <div className="mt-6 font-medium">
            <span className="font-semibold">Searching for:</span>{" "}
            <span id="search-term">{searchTerm}</span>
          </div>
        )}
      </div>
      <div className="mt-6 w-full overflow-auto">
        <AdvocatesTable
          advocates={advocates}
          isLoading={loading}
          error={error}
          search={search}
        />
      </div>
      <div>
        <Paginator
          pageInfo={pageInfo}
          pageSizeOptions={[10, 20, 50, 100]}
          onPageSizeChange={setPageSize}
          onPageChange={setPageNumber}
        />
      </div>
    </main>
  );
}

interface AdvocateTableProps {
  advocates: Advocate[];
  isLoading: boolean;
  error: Error | null;
  search: (term: string) => void;
}

function AdvocatesTable({
  advocates,
  error,
  isLoading,
  search,
}: AdvocateTableProps) {
  function TableRows() {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={7} className="py-4 text-center">
            Loading advocates...
          </td>
        </tr>
      );
    }
    if (advocates.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="py-4 text-center">
            No advocates found.
          </td>
        </tr>
      );
    }
    return advocates.map((advocate) => {
      return (
        <tr className="border-t-2 border-slate-200" key={advocate.id}>
          <td className="px-2 py-1">{advocate.firstName}</td>
          <td className="px-2 py-1">{advocate.lastName}</td>
          <td className="px-2 py-1">{advocate.city}</td>
          <td className="px-2 py-1">{advocate.degree}</td>
          <td className="flex flex-wrap gap-2 px-2 py-1">
            {advocate.specialties.map((s) => (
              <button
                key={s}
                className="min-w-fit cursor-pointer text-nowrap rounded-full bg-slate-200 px-4 py-2 text-left text-black hover:bg-slate-300"
                onClick={() => search(s)}>
                {s}
              </button>
            ))}
          </td>
          <td className="px-2 py-1 text-center">
            {advocate.yearsOfExperience}
          </td>
          <td className="px-2 py-1 text-center">
            <a
              className="text-green-600 hover:text-green-700"
              href={`tel:${advocate.phoneNumber}`}>
              {formatPhoneNumber(advocate.phoneNumber.toString())}
            </a>
          </td>
        </tr>
      );
    });
  }

  return (
    <table className="min-w-full" cellSpacing={8}>
      <thead className="overflow-x-scroll">
        {error && (
          <tr>
            <th colSpan={7} className="bg-red-100 text-red-700">
              {error.message || <>An unknown error occurred</>}
            </th>
          </tr>
        )}
        <tr>
          <th className="text-nowrap bg-slate-100 px-3 py-2 font-bold">
            First Name
          </th>
          <th className="text-nowrap border-l-2 border-slate-200 bg-slate-100 px-3 py-2 font-bold">
            Last Name
          </th>
          <th className="text-nowrap border-l-2 border-slate-200 bg-slate-100 px-3 py-2 font-bold">
            City
          </th>
          <th className="text-nowrap border-l-2 border-slate-200 bg-slate-100 px-3 py-2 font-bold">
            Degree
          </th>
          <th className="text-nowrap border-l-2 border-slate-200 bg-slate-100 px-3 py-2 font-bold">
            Specialties
          </th>
          <th className="text-nowrap border-l-2 border-slate-200 bg-slate-100 px-3 py-2 font-bold">
            Years of Experience
          </th>
          <th className="text-nowrap border-l-2 border-slate-200 bg-slate-100 px-3 py-2 font-bold">
            Phone Number
          </th>
        </tr>
      </thead>
      <tbody className="overflow-x-scroll">
        <TableRows />
      </tbody>
    </table>
  );
}

interface PaginatorProps<TPageSizeOptions extends number[]> {
  pageInfo: PageInfo;
  pageSizeOptions: TPageSizeOptions;
  defaultPageSize?: TPageSizeOptions[number];
  onPageSizeChange?: (pageSize: TPageSizeOptions[number]) => void;
  onPageChange?: (pageNumber: number) => void;
}

function Paginator<TPageSizeOptions extends number[]>({
  pageInfo: { nextPage, totalItems, totalPages },
  defaultPageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: PaginatorProps<TPageSizeOptions>) {
  const pageNumber = nextPage ? nextPage - 1 : 1;
  const [pageSize, setPageSize] = useState(
    defaultPageSize || pageSizeOptions[0],
  );

  useEffect(() => {
    if (onPageSizeChange) {
      onPageSizeChange(pageSize);
    }
  }, [pageSize, onPageSizeChange]);

  const pageNumbersToShow = [
    pageNumber - 2,
    pageNumber - 1,
    pageNumber,
    pageNumber + 1,
    pageNumber + 2,
  ].filter((num) => num > 0 && num <= totalPages);
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        Page {pageNumber} of {totalPages}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button
            className="mr-2 rounded bg-gray-200 px-4 py-2"
            onClick={() => {
              console.log("Previous page clicked", pageNumber - 1);
              if (pageNumber > 1) {
                onPageChange && onPageChange(pageNumber - 1);
              }
            }}
            disabled={pageNumber <= 1}>
            {"<"}
          </button>
          {pageNumbersToShow.map((num) => (
            <button
              key={num}
              className={`rounded px-4 py-2 ${
                num === pageNumber ? "bg-green-700 text-white" : "bg-gray-200"
              }`}
              onClick={() => {
                console.log("Page number clicked:", num);
                onPageChange && onPageChange(num);
              }}>
              {num}
            </button>
          ))}
          <button
            className="ml-2 rounded bg-gray-200 px-4 py-2"
            onClick={() => {
              console.log("Next page clicked", pageNumber + 1);
              if (pageNumber < totalPages) {
                onPageChange && onPageChange(pageNumber + 1);
              }
            }}
            disabled={pageNumber >= totalPages}>
            {">"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => {
              if (parseInt(e.target.value)) setPageSize(+e.target.value);
            }}
            className="rounded border border-slate-300 px-2 py-1">
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <label htmlFor="page-size" className="font-normal">
            {totalItems ? <>of {totalItems} items</> : <>per page</>}
          </label>
        </div>
      </div>
    </div>
  );
}
