import React, { useState } from "react";

function Profile() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [phone, setPhone] = useState("");
  const [vatNumber, setVatNumber] = useState("");

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const firstNameValue = formData.get("firstName") as string;
    const lastNameValue = formData.get("lastName") as string;
    const emailValue = formData.get("email") as string;
    const birthdayValue = formData.get("birthday") as string;
    const phoneValue = formData.get("phone") as string;
    const vatNumberValue = formData.get("vatNumber") as string;

    // Perform any necessary validation or data processing here

    // Update the state with the submitted form values
    setFirstName(firstNameValue);
    setLastName(lastNameValue);
    setEmail(emailValue);
    setBirthday(birthdayValue);
    setPhone(phoneValue);
    setVatNumber(vatNumberValue);
  };

  return (
    <div className="container">
      <h1>Welcome to your Restaurant Client Account</h1>
      <div className="profile">
        <h2>Profile Information</h2>

        {/* Display existing account information */}
        <div className="account-info">
          <h3>Account Information:</h3>
          <p>First Name: {firstName}</p>
          <p>Last Name: {lastName}</p>
          <p>Email: {email}</p>
        </div>

        {/* Update additional information */}
        <div className="update-info">
          <h3>Update Additional Information:</h3>
          <form onSubmit={handleFormSubmit}>
            <label htmlFor="firstName">First Name:</label>
            <input type="text" id="firstName" name="firstName" required />

            <label htmlFor="lastName">Last Name:</label>
            <input type="text" id="lastName" name="lastName" required />

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" required />

            <label htmlFor="birthday">Birthday:</label>
            <input type="date" id="birthday" name="birthday" required />

            <label htmlFor="phone">Telephone:</label>
            <input type="tel" id="phone" name="phone" required />

            <label htmlFor="vatNumber">VAT Number:</label>
            <input type="text" id="vatNumber" name="vatNumber" required />

            <button type="submit">Update Profile</button>
          </form>
        </div>

        {/* Button for booking */}
        <div className="booking-btn">
          <a href="/bookings">Make a Booking</a>
        </div>
      </div>
    </div>
  );
}

export default Profile;
