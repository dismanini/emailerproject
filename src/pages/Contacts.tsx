
import { useEffect, useState, type FormEvent } from "react";
import Pagination from "../components/Pagination";
import {
  getContacts,
  createContact,
  deleteContact,
  updateContactStatus,
} from "../services/api";
import type { Contact } from "../services/api";

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const load = async () => {
    try {
      setContacts(await getContacts());
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load contacts."
      );
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // Add a new contact
  const add = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await createContact({
        name: name.trim(),
        email: email.trim(),
      });

      setName("");
      setEmail("");
      setNotice("Contact added successfully.");
      setError("");
      setCurrentPage(1);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to add contact."
      );
    }
  };

  // Delete a contact
  const remove = async (id: number) => {
    if (!window.confirm("Delete this contact?")) return;

    try {
      await deleteContact(id);
      setNotice("Contact deleted successfully.");
      setError("");
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete contact."
      );
    }
  };

  // Update contact subscription status
  const changeStatus = async (
    id: number,
    status: "pending" | "subscribed" | "unsubscribed"
  ) => {
    try {
      await updateContactStatus(id, status);
      setNotice("Contact status updated successfully.");
      setError("");
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update status."
      );
    }
  };

  // Search contacts
  const filtered = contacts.filter((contact) =>
    `${contact.name} ${contact.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Reset pagination when the search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Calculate pagination after filtering
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedContacts = filtered.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Return to the last available page after deleting contacts
  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [currentPage, totalPages]);

  return (
    <section className="content-card">
      <h2>Contact Management</h2>

      {notice && <p role="status">{notice}</p>}
      {error && <p className="error-message">{error}</p>}

      <form className="contact-form" onSubmit={add}>
        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button className="primary-button" type="submit">
          Add Contact
        </button>
      </form>

      <div className="search-box">
        <input
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedContacts.length > 0 ? (
              paginatedContacts.map((contact) => (
                <tr key={contact.id}>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>

                  <td>
                    <select
                      value={contact.consent_status}
                      onChange={(e) =>
                        void changeStatus(
                          contact.id,
                          e.target.value as
                            | "pending"
                            | "subscribed"
                            | "unsubscribed"
                        )
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="subscribed">Subscribed</option>
                      <option value="unsubscribed">Unsubscribed</option>
                    </select>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => void remove(contact.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>
                  {search
                    ? "No matching contacts found."
                    : "No contacts available."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p>
        Showing {filtered.length === 0 ? 0 : startIndex + 1}–
        {Math.min(startIndex + itemsPerPage, filtered.length)} of{" "}
        {filtered.length} contacts
      </p>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}
