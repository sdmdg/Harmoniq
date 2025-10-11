import request from "supertest";
import { expect } from "chai";
import app from "../../server.js";
import jwt from "jsonwebtoken";

describe("Auth API Tests", () => {
  let token;
  const user = {
    username: "apitester",
    email: "apitester@mail.com",
    password: "abc123",
  };

  // --- Register User ---
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(user);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("user");
    expect(res.body).to.have.property("token");
    expect(res.body.user).to.have.property("email", user.email);
    expect(res.body.user).to.have.property("username", user.username);
    expect(res.body.user).to.have.property("role", "listener");
    token = res.body.token;
  });

  it("should fail to register without required fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: user.email }); // Missing username and password
    
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message");
  });

  it("should fail to register a user with existing email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(user);
    
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "User already exists with this email.");
  });

  // --- Login User ---
  it("should login successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password,
      });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("token");
    expect(res.body).to.have.property("user");
    expect(res.body.user).to.have.property("id");
    expect(res.body.user).to.have.property("username", user.username);
    expect(res.body.user).to.have.property("role", "listener");
    token = res.body.token;
  });

  it("should login with rememberMe option", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password,
        rememberMe: true,
      });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("token");
    
    // Verify token has 7d expiration
    const decoded = jwt.decode(res.body.token);
    const expiresIn = decoded.exp - decoded.iat;
    expect(expiresIn).to.be.closeTo(7 * 24 * 60 * 60, 10); // 7 days in seconds
  });

  it("should fail login with incorrect password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: "wrongpassword",
      });
    
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Invalid credentials");
  });

  it("should fail login with unregistered email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nonexistent@mail.com",
        password: "whatever",
      });
    
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "User not found");
  });

  // --- Password Change with Token ---
  it("should fail password change without token", async () => {
    const res = await request(app)
      .post("/api/auth/pwd-change")
      .send({
        new_password: "newpass123",
      });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Token and new password are required.");
  });

  it("should fail password change without new_password", async () => {
    const validToken = jwt.sign(
      { id: 1, request: "PASSWORD-RESET-BY-MAIL" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(app)
      .post("/api/auth/pwd-change")
      .send({
        token: validToken,
      });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Token and new password are required.");
  });

  it("should fail password change with invalid token", async () => {
    const res = await request(app)
      .post("/api/auth/pwd-change")
      .send({
        token: "invalid.token.here",
        new_password: "newpass123",
      });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Invalid or expired token.");
  });

  it("should fail password change with token missing request field", async () => {
    const invalidToken = jwt.sign(
      { id: 1 }, // Missing 'request' field
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(app)
      .post("/api/auth/pwd-change")
      .send({
        token: invalidToken,
        new_password: "newpass123",
      });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "request not found.");
  });

  it("should change password successfully with PASSWORD-RESET-BY-MAIL token", async function() {
    this.timeout(5000); // Increase timeout for this test
    
    // You'll need to get the actual user ID from the registration/login
    // For this test, we assume the user exists and we have their ID
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password,
      });

    const userId = loginRes.body.user.id;

    // Create a valid password reset token
    const resetToken = jwt.sign(
      { id: userId, request: "PASSWORD-RESET-BY-MAIL" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(app)
      .post("/api/auth/pwd-change")
      .send({
        token: resetToken,
        new_password: "newpass123",
      });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Password updated successfully!");
  });

  it("should login successfully with new password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: "newpass123",
      });
    
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("token");
  });

  it("should fail login with old password after password change", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: user.password, // Old password
      });
    
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Invalid credentials");
  });

  it("should change password with PASSWORD-RESET-BY-FORGOTPWD token", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: user.email,
        password: "newpass123",
      });

    const userId = loginRes.body.user.id;

    const resetToken = jwt.sign(
      { id: userId, request: "PASSWORD-RESET-BY-FORGOTPWD" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const res = await request(app)
      .post("/api/auth/pwd-change")
      .send({
        token: resetToken,
        new_password: "anotherpass456",
      });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Password updated successfully!");
  });
});