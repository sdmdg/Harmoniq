import request from "supertest";
import { expect } from "chai";
import app from "../../server.js";
import path from "path";
import fs from "fs";

describe("Profile API Tests (Updated)", () => {
  let listenerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUyNWMyZWEzLTY4OGMtNGI4Mi1hNjgxLTI1YTM4YzA1ZWM2ZiIsInVzZXJuYW1lIjoibWFsYWthMiIsImVtYWlsIjoibWFsYWthZ3VuYXdhcmRhbmEyMDAyQGdtYWlsLmNvbSIsInJvbGUiOiJsaXN0ZW5lciIsImlhdCI6MTc2MDE3ODU5NSwiZXhwIjoxNzYwMjY0OTk1fQ.hUUrWk5g1rVGi5sU0j1aBrwpgARYjTjg4DZ8wk82P9w';
  let artistToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYwYTM1NDY3LWFmNTMtNDg5OC1iZGRiLTkwNmE0ZjIwZWZmZiIsInVzZXJuYW1lIjoiVGF5bG9yU3dpZnQiLCJlbWFpbCI6IlRheWxvclN3aWZ0QGdtYWlsLmNvbSIsInJvbGUiOiJhcnRpc3QiLCJpYXQiOjE3NjAxNzg1MTgsImV4cCI6MTc2MDI2NDkxOH0.Iukz4YT85Wa5zFps6QOz8yXGbfb-CchwomhK3RwTE5g';
  let adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc0MjcxMGJmLTM2NWMtNGY3NC04NmQ1LWI3OGU4ZWQ2YjYzZSIsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDE3ODYyMSwiZXhwIjoxNzYwMjY1MDIxfQ.G29WFhrBNzcXikMVFl7xmWVBnR-2ebaEXP5qBG5nZhU';
  let listenerUserId = '525c2ea3-688c-4b82-a681-25a38c05ec6f';
  let artistUserId = 'f0a35467-af53-4898-bddb-906a4f20efff';
  let testImagePath;

  before(async function () {
    this.timeout(10000);

    // Create minimal test image
    testImagePath = path.join(process.cwd(), "test", "fixtures", "test-image.jpg");
    const fixturesDir = path.dirname(testImagePath);
    if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir, { recursive: true });

    if (!fs.existsSync(testImagePath)) {
      const minimalJpeg = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xDA,
        0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
        0xD2, 0xFF, 0xD9
      ]);
      fs.writeFileSync(testImagePath, minimalJpeg);
    }
  });

  // --- Upload Profile Picture ---
  describe("POST /api/profile/upload-image", () => {
    it("should fail without file", async () => {
      const res = await request(app)
        .post("/api/profile/upload-image")
        .set("Authorization", `Bearer ${listenerToken}`);
      expect(res.status).to.be.oneOf([400, 500]);
    });

    it("should allow listener to upload profile picture", async () => {
      const res = await request(app)
        .post("/api/profile/upload-image")
        .set("Authorization", `Bearer ${listenerToken}`)
        .attach("file", testImagePath);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("profilePic");
    });

    it("should allow artist to upload profile picture", async () => {
      const res = await request(app)
        .post("/api/profile/upload-image")
        .set("Authorization", `Bearer ${artistToken}`)
        .attach("file", testImagePath);

      expect(res.status).to.equal(200);
    });

    it("should allow admin to upload profile picture", async () => {
      const res = await request(app)
        .post("/api/profile/upload-image")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("file", testImagePath);

      expect(res.status).to.equal(200);
    });
  });

  // --- Update Password ---
  describe("POST /api/profile/update-password", () => {
    it("should fail without authentication", async () => {
      const res = await request(app)
        .post("/api/profile/update-password")
        .send({ currentPassword: "test123", newPassword: "newpass456" });
      expect(res.status).to.be.oneOf([401, 403]);
    });

    it("should fail with missing fields", async () => {
      const res = await request(app)
        .post("/api/profile/update-password")
        .set("Authorization", `Bearer ${listenerToken}`)
        .send({ currentPassword: "test123" });
      expect(res.status).to.equal(400);
    });

    it("should fail with wrong password", async () => {
      const res = await request(app)
        .post("/api/profile/update-password")
        .set("Authorization", `Bearer ${listenerToken}`)
        .send({ currentPassword: "wrong", newPassword: "newpass456" });
      expect(res.status).to.equal(400);
    });
  });

  // --- Become Artist ---
  describe("POST /api/profile/become-artist", () => {
    let freshListenerToken;

    before(async () => {
      const u = { username: "fresh", email: "fresh@mail.com", password: "test123" };
      const reg = await request(app).post("/api/auth/register").send(u);
      freshListenerToken = reg.body.token;
    });

    it("should fail without authentication", async () => {
      const res = await request(app)
        .post("/api/profile/become-artist")
        .send({ artistName: "Test Artist" });
      expect(res.status).to.be.oneOf([401, 403]);
    });
  });

  // --- Get Artist Details ---
  describe("GET /api/profile/artist-details/:id", () => {
    before(async () => {
      await request(app)
        .post("/api/profile/become-artist")
        .set("Authorization", `Bearer ${artistToken}`)
        .send({ artistName: "Profile Artist", artistDescription: "desc" });
    });

    it("should fail without auth", async () => {
      const res = await request(app).get(`/api/profile/artist-details/${artistUserId}`);
      expect(res.status).to.be.oneOf([401, 403]);
    });

    it("should fail for listener", async () => {
      const res = await request(app)
        .get(`/api/profile/artist-details/${artistUserId}`)
        .set("Authorization", `Bearer ${listenerToken}`);
      expect(res.status).to.be.oneOf([401, 403]);
    });

    it("should return artist details for artist role", async () => {
      const res = await request(app)
        .get(`/api/profile/artist-details/${artistUserId}`)
        .set("Authorization", `Bearer ${artistToken}`);
      expect(res.status).to.equal(200);
    });

    it("should return 404 for non-existent artist", async () => {
      const res = await request(app)
        .get("/api/profile/artist-details/99999")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).to.equal(404);
    });
  });

  // --- Update Artist Details ---
  describe("POST /api/profile/update-artist-details", () => {
    it("should fail without auth", async () => {
      const res = await request(app)
        .post("/api/profile/update-artist-details")
        .send({ artistName: "Updated Artist" });
      expect(res.status).to.be.oneOf([401, 403]);
    });

    it("should fail for listener", async () => {
      const res = await request(app)
        .post("/api/profile/update-artist-details")
        .set("Authorization", `Bearer ${listenerToken}`)
        .send({ artistName: "Updated Artist" });
      expect(res.status).to.be.oneOf([401, 403]);
    });

    it("should update artist details for artist", async () => {
      const res = await request(app)
        .post("/api/profile/update-artist-details")
        .set("Authorization", `Bearer ${artistToken}`)
        .send({ artistName: "Updated Artist", artistDescription: "New Desc" });
      expect(res.status).to.equal(200);
      expect(res.body.artist_name).to.equal("Updated Artist");
    });
  });

  // --- Get Home Page ---
  describe("GET /api/profile/getHomePage", () => {
    it("should fail without auth", async () => {
      const res = await request(app).get("/api/profile/getHomePage");
      expect(res.status).to.be.oneOf([401, 403]);
    });

    it("should work for listener", async () => {
      const res = await request(app)
        .get("/api/profile/getHomePage")
        .set("Authorization", `Bearer ${listenerToken}`);
      expect(res.status).to.equal(200);
    });

    it("should work for artist", async () => {
      const res = await request(app)
        .get("/api/profile/getHomePage")
        .set("Authorization", `Bearer ${artistToken}`);
      expect(res.status).to.equal(200);
    });
  });
});
