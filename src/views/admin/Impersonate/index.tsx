import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from 'jwt-decode';
import { email } from "valibot";

const Impersonate = () => {
  const [filter, setFilter] = useState(""); // Search filter input
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]); // Filtered profiles
  const [profiles, setProfiles] = useState<any[]>([]); // All profiles fetched from the API
  const [currentPage, setCurrentPage] = useState(1); // Current page in pagination
  const [profilesPerPage] = useState(10); // Number of profiles to show per page
  const [loading, setLoading] = useState(true); // Loading state

  const router = useRouter();

  // Function to fetch profiles from the API
  const handleProfiles = async () => {
    try {
      setLoading(true); // Start loading
      const response = await fetch("/api/admin/impersonate", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json(); // Assuming API returns an object with `result.rows`
      return data; // Return the data
    } catch (error) {
      console.error("Error fetching profiles:", error);
      return []; // Return an empty array in case of an error
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Fetch profiles on component mount
  useEffect(() => {
    const fetchProfiles = async () => {
      const data = await handleProfiles();
      console.log(data.result.rows); // Debugging: log API response
      setProfiles(data.result.rows); // Set the profiles state
      setFilteredProfiles(data.result.rows); // Initially display all profiles
    };

    fetchProfiles();
  }, []);

  // Handle search input changes and filter profiles
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilter(value);

    // Filter profiles by username
    const filtered = profiles.filter((profile) =>
      profile.Username.toLowerCase().startsWith(value.toLowerCase())
    );
    setFilteredProfiles(filtered);
    setCurrentPage(1); // Reset to the first page after filtering
  };

  // Handle profile click and redirect the user
  const handleProfileClick = async (profile: any) => {
    console.log(`Impersonating ${JSON.stringify(profile)}`); // Debugging: log the impersonation

    try {
        const response = await fetch("/api/admin/goto", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: profile.Email }),
        });

        const data = await response.json();
        console.log(data)
        const decoded = jwtDecode(data.jwtToken);
        localStorage.setItem('loginInfo', data.jwtToken);
        localStorage.setItem('logged_in_profile', data.currentProfileId);
        localStorage.setItem('profileUsername', data.currentuserName);

        window.open("https://swing-social-website.vercel.app/", "_blank");
    } catch (error) {
        console.error("Error impersonating profile:", error);
    }
  };

  // Pagination Logic
  const indexOfLastProfile = currentPage * profilesPerPage;
  const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
  const currentProfiles = filteredProfiles.slice(
    indexOfFirstProfile,
    indexOfLastProfile
  ); // Profiles to display on the current page

  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage); // Total number of pages

  // Function to generate dynamic pagination controls
  const getPaginationButtons = () => {
    const buttons = [];
    const delta = 2; // Number of pages to show around the current page

    // Add "1" and "2" (always show the first two pages)
    if (totalPages > 1) {
      buttons.push(1);
      if (totalPages > 2) buttons.push(2);
    }

    // Add "..." after the first few pages if necessary
    if (currentPage > delta + 2) {
      buttons.push("...");
    }

    // Add pages around the current page (dynamic range)
    for (
      let i = Math.max(3, currentPage - delta);
      i <= Math.min(totalPages - 2, currentPage + delta);
      i++
    ) {
      buttons.push(i);
    }

    // Add "..." before the last few pages if necessary
    if (currentPage < totalPages - delta - 1) {
      buttons.push("...");
    }

    // Add the last two pages (always show the last two pages)
    if (totalPages > 2) {
      if (totalPages > 3) buttons.push(totalPages - 1);
      buttons.push(totalPages);
    }

    return buttons;
  };

  // Handle pagination button click
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Impersonate a User</h1>
      <div style={{ marginBottom: "20px" }}>
        {/* Input for filtering profiles */}
        <input
          type="text"
          placeholder="Enter profile name..."
          value={filter}
          onChange={handleInputChange}
          style={{
            padding: "10px",
            fontSize: "16px",
            width: "100%",
            maxWidth: "400px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* Loading Animation */}
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          {/* <div
            style={{
              display: "inline-block",
              width: "50px",
              height: "50px",
              border: "5px solid #f3f3f3",
              borderTop: "5px solid #007bff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          /> */}
          <p>Loading profiles...</p>
        </div>
      ) : (
        <div>
          {currentProfiles.length > 0 ? (
            <ul style={{ listStyle: "none", padding: "0" }}>
              {currentProfiles.map((profile) => (
                <li
                  key={profile.Id} // Use unique `Id` as the key
                  onClick={() =>  handleProfileClick(profile)} // Pass username to click handler
                  style={{
                    padding: "10px",
                    margin: "5px 0",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  {profile.Username} {/* Render the username */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No profiles found.</p>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && filteredProfiles.length > profilesPerPage && ( // Display pagination only if there are multiple pages
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Previous Button */}
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "10px",
              margin: "0 5px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: currentPage === 1 ? "#eee" : "#fff",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            Previous
          </button>

          {/* Dynamic Page Numbers */}
          {getPaginationButtons().map((button, index) =>
            button === "..." ? (
              <span key={index} style={{ margin: "0 5px" }}>
                ...
              </span>
            ) : (
              <button
                key={index}
                onClick={() => paginate(Number(button))}
                style={{
                  padding: "10px",
                  margin: "0 5px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: currentPage === button ? "#007bff" : "#fff",
                  color: currentPage === button ? "#fff" : "#000",
                  cursor: "pointer",
                }}
              >
                {button}
              </button>
            )
          )}

          {/* Next Button */}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: "10px",
              margin: "0 5px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: currentPage === totalPages ? "#eee" : "#fff",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Impersonate;