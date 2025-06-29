"use client";

import { Advocate } from "@/db/schema";
import { ChangeEvent, useEffect, useState } from "react";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`/api/advocates?search=${encodeURIComponent(searchTerm)}`)
      .then(async (response) => {
        if (response.status !== 200) {
          throw new Error(
            `Failed to fetch advocates: ${response.status} ${response.statusText}`,
            { cause: await response.text() },
          );
        }
        response.json().then((jsonResponse) => {
          setAdvocates(jsonResponse.data);
        });
      })
      .catch((error) => {
        console.error("Error fetching advocates:", error);
      });
  }, [searchTerm]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;

    document.getElementById("search-term")!.innerHTML = searchTerm;

    setSearchTerm(searchTerm);
  };

  const onClick = () => {
    setSearchTerm("");
  };

  return (
    <main className="m-6 block">
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span id="search-term"></span>
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
          {advocates.map((advocate) => {
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
          })}
        </tbody>
      </table>
    </main>
  );
}
