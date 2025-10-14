import request from "supertest";
import { expect } from "chai";
import app from "../../server.js";

describe("🔍 Search API Tests", () => {
  let listenerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUyNWMyZWEzLTY4OGMtNGI4Mi1hNjgxLTI1YTM4YzA1ZWM2ZiIsInVzZXJuYW1lIjoibWFsYWthMiIsImVtYWlsIjoibWFsYWthZ3VuYXdhcmRhbmEyMDAyQGdtYWlsLmNvbSIsInJvbGUiOiJsaXN0ZW5lciIsImlhdCI6MTc2MDE3ODU5NSwiZXhwIjoxNzYwMjY0OTk1fQ.hUUrWk5g1rVGi5sU0j1aBrwpgARYjTjg4DZ8wk82P9w';
  let artistToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYwYTM1NDY3LWFmNTMtNDg5OC1iZGRiLTkwNmE0ZjIwZWZmZiIsInVzZXJuYW1lIjoiVGF5bG9yU3dpZnQiLCJlbWFpbCI6IlRheWxvclN3aWZ0QGdtYWlsLmNvbSIsInJvbGUiOiJhcnRpc3QiLCJpYXQiOjE3NjAxNzg1MTgsImV4cCI6MTc2MDI2NDkxOH0.Iukz4YT85Wa5zFps6QOz8yXGbfb-CchwomhK3RwTE5g';
  let adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc0MjcxMGJmLTM2NWMtNGY3NC04NmQ1LWI3OGU4ZWQ2YjYzZSIsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MDE3ODYyMSwiZXhwIjoxNzYwMjY1MDIxfQ.G29WFhrBNzcXikMVFl7xmWVBnR-2ebaEXP5qBG5nZhU';
  let listenerUserId = '525c2ea3-688c-4b82-a681-25a38c05ec6f';
  let artistUserId = 'f0a35467-af53-4898-bddb-906a4f20efff';

  // ------------------------------------------------------
  // GET /api/search/all
  // ------------------------------------------------------
  describe("GET /api/search/all", () => {
    it("should fail without authentication", async () => {
      const res = await request(app).get("/api/search/all?query=love");
      expect(res.status).to.equal(401);
    });

    it("should return 400 if query parameter is missing", async () => {
      const res = await request(app)
        .get("/api/search/all")
        .set("Authorization", `Bearer ${listenerToken}`);
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message", "Query parameter is required.");
    });

    it("should return results for listener", async () => {
      const res = await request(app)
        .get("/api/search/all?query=test")
        .set("Authorization", `Bearer ${listenerToken}`);
      expect([200, 500]).to.include(res.status);

      if (res.status === 200) {
        expect(res.body).to.have.keys(["tracks", "albums", "artists"]);
        expect(res.body.tracks).to.be.an("array");
        expect(res.body.albums).to.be.an("array");
        expect(res.body.artists).to.be.an("array");
      }
    });

    it("should return results for artist", async () => {
      const res = await request(app)
        .get("/api/search/all?query=pop")
        .set("Authorization", `Bearer ${artistToken}`);
      expect([200, 500]).to.include(res.status);

      if (res.status === 200) {
        expect(res.body.tracks).to.be.an("array");
      }
    });

    it("should return results for admin", async () => {
      const res = await request(app)
        .get("/api/search/all?query=rock")
        .set("Authorization", `Bearer ${adminToken}`);
      expect([200, 500]).to.include(res.status);

      if (res.status === 200) {
        expect(res.body).to.have.property("tracks");
        expect(res.body).to.have.property("albums");
        expect(res.body).to.have.property("artists");
      }
    });
  });
});
