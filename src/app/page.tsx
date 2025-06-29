"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Advocate } from "@/db/schema";
import { useAdvocateSearch } from "@/lib/use_advocate_search";
import { ChangeEvent } from "react";

export default function Home() {
  const { advocates, error, loading, search, searchTerm } = useAdvocateSearch();

  const onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    search(value);
  };

  const onClick = () => {
    search("");
  };

  return (
    <main className="container mx-auto grid h-screen grid-rows-[auto_auto_1fr] p-6">
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
              {advocate.phoneNumber}
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
