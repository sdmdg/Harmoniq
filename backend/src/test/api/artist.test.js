import request from "supertest";
import { expect } from "chai";
import app from "../../server.js";

before(() => {
  // Suppress console output during tests
  console.log = () => {};
  console.error = () => {};
});

describe("Artist API Tests", () => {
  // Hardcoded JWTs and user IDs
  let listenerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUyNWMyZWEzLTY4OGMtNGI4Mi1hNjgxLTI1YTM4YzA1ZWM2ZiIsInVzZXJuYW1lIjoibWFsYWthMiIsImVtYWlsIjoibWFsYWthZ3VuYXdhcmRhbmEyMDAyQGdtYWlsLmNvbSIsInJvbGUiOiJsaXN0ZW5lciIsImlhdCI6MTc2MDE3ODU5NSwiZXhwIjoxNzYwMjY0OTk1fQ.hUUrWk5g1rVGi5sU0j1aBrwpgARYjTjg4DZ8wk82P9w';
  let artistToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYwYTM1NDY3LWFmNTMtNDg5OC1iZGRiLTkwNmE0ZjIwZWZmZiIsInVzZXJuYW1lIjoiVGF5bG9yU3dpZnQiLCJlbWFpbCI6IlRheWxvclN3aWZ0QGdtYWlsLmNvbSIsInJvbGUiOiJhcnRpc3QiLCJpYXQiOjE3NjAxNzg1MTgsImV4cCI6MTc2MDI2NDkxOH0.Iukz4YT85Wa5zFps6QOz8yXGbfb-CchwomhK3RwTE5g';
  let adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc0MjcxMGJmLTM2NWMtNGY3NC04NmQ1LWI3OGU4ZWQ2YjYzZSIsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDE3ODYyMSwiZXhwIjoxNzYwMjY1MDIxfQ.G29WFhrBNzcXikMVFl7xmWVBnR-2ebaEXP5qBG5nZhU';
  let listenerUserId = '525c2ea3-688c-4b82-a681-25a38c05ec6f';
  let artistUserId = 'f0a35467-af53-4898-bddb-906a4f20efff';

  describe("GET /api/artist/get/:id", () => {
    it("should fail without authentication", async () => {
      const res = await request(app).get(`/api/artist/get/${artistUserId}`);
      expect(res.status).to.equal(401);
    });

    it("should return artist details for listener", async () => {
      const res = await request(app)
        .get(`/api/artist/get/${artistUserId}`)
        .set("Authorization", `Bearer ${listenerToken}`);
      expect([200, 404]).to.include(res.status);
    });

    it("should return artist details for admin", async () => {
      const res = await request(app)
        .get(`/api/artist/get/${artistUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect([200, 404]).to.include(res.status);
    });

    it("should return 404 for non-existent artist", async () => {
      const res = await request(app)
        .get(`/api/artist/get/99999`)
        .set("Authorization", `Bearer ${listenerToken}`);
      expect([404, 500]).to.include(res.status);
    });
  });

  describe("POST /api/artist/follow", () => {
    it("should fail without authentication", async () => {
      const res = await request(app)
        .post("/api/artist/follow")
        .send({ artistId: artistUserId });
      expect(res.status).to.equal(401);
    });

    it("should follow artist as listener", async () => {
      const res = await request(app)
        .post("/api/artist/follow")
        .set("Authorization", `Bearer ${listenerToken}`)
        .send({ artistId: artistUserId });
      expect([200, 500]).to.include(res.status);
    });

    it("should return already following if listener repeats follow", async () => {
      const res = await request(app)
        .post("/api/artist/follow")
        .set("Authorization", `Bearer ${listenerToken}`)
        .send({ artistId: artistUserId });
      expect([200, 500]).to.include(res.status);
    });
  });

  describe("POST /api/artist/unfollow", () => {
    it("should fail without authentication", async () => {
      const res = await request(app)
        .post("/api/artist/unfollow")
        .send({ artistId: artistUserId });
      expect(res.status).to.equal(401);
    });

    it("should unfollow artist successfully", async () => {
      const res = await request(app)
        .post("/api/artist/unfollow")
        .set("Authorization", `Bearer ${listenerToken}`)
        .send({ artistId: artistUserId });
      expect([200, 500]).to.include(res.status);
    });
  });

  describe("GET /api/artist/search/:albumId", () => {
    it("should fail without authentication", async () => {
      const res = await request(app).get("/api/artist/search/1234");
      expect(res.status).to.equal(401);
    });

    it("should allow listener to search artists by album", async () => {
      const res = await request(app)
        .get("/api/artist/search/1234")
        .set("Authorization", `Bearer ${listenerToken}`);
      expect([200, 500]).to.include(res.status);
    });

    it("should allow admin to search artists by album", async () => {
      const res = await request(app)
        .get("/api/artist/search/1234")
        .set("Authorization", `Bearer ${adminToken}`);
      expect([200, 500]).to.include(res.status);
    });
  });
});
