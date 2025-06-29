"use client";

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
    <main className="m-6 block">
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span id="search-term">{searchTerm}</span>
        </p>
        <input
          className="border border-solid border-black"
          value={searchTerm}
          onChange={onChange}
        />
        <button onClick={onClick}>Reset Search</button>
      </div>
      <br />
      <br />
      <table>
        <thead>
          {error && (
            <tr>
              <th colSpan={7}>
                {error.message || <>An unknown error occurred</>}
              </th>
            </tr>
          )}
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Specialties</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7}>Loading...</td>
            </tr>
          ) : (
            advocates.map((advocate) => {
              return (
                <tr key={advocate.id}>
                  <td>{advocate.firstName}</td>
                  <td>{advocate.lastName}</td>
                  <td>{advocate.city}</td>
                  <td>{advocate.degree}</td>
                  <td>
                    {advocate.specialties.map((s) => (
                      <div key={s}>{s}</div>
                    ))}
                  </td>
                  <td>{advocate.yearsOfExperience}</td>
                  <td>{advocate.phoneNumber}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </main>
  );
}
