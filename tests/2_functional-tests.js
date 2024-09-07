/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test("#example Test GET /api/books", function (done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        assert.property(
          res.body[0],
          "commentcount",
          "Books in array should contain commentcount",
        );
        assert.property(
          res.body[0],
          "title",
          "Books in array should contain title",
        );
        assert.property(
          res.body[0],
          "_id",
          "Books in array should contain _id",
        );
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function () {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("Test POST /api/books with title", function (done) {
          const bodyPayload = {
            title: "Faux Book 1",
          };

          chai
            .request(server)
            .keepOpen()
            .post("/api/books")
            .send(bodyPayload)
            .end((_err, res) => {
              assert.equal(res.status, 200);

              assert.isObject(res.body);
              assert.property(res.body, "title");
              assert.equal(res.body.title, "Faux Book 1");
              assert.property(res.body, "_id");

              done();
            });
        });

        test("Test POST /api/books with no title given", function (done) {
          const bodyPayload = {};

          chai
            .request(server)
            .keepOpen()
            .post("/api/books")
            .send(bodyPayload)
            .end((_err, res) => {
              assert.equal(res.status, 200);

              assert.isString(res.body);
              assert.equal(res.body, "missing required field title");

              done();
            });
        });
      },
    );

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get("/api/books")
          .end((_err, res) => {
            assert.equal(res.status, 200);

            assert.isArray(res.body);

            res.body.forEach((book) => {
              assert.isObject(book);
              assert.property(book, "title");
              assert.isString(book.title);
              assert.property(book, "_id");
              assert.property(book, "commentcount");
              assert.isNumber(book.commentcount);
            });

            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get("/api/books/5f665eb46e296f6b9b6a504d")
          .end((_err, res) => {
            assert.equal(res.status, 200);

            assert.isString(res.body);
            assert.equal(res.body, "no book exists");

            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        const bodyPayload = {
          title: "Faux Book 1",
        };

        chai
          .request(server)
          .keepOpen()
          .post("/api/books")
          .send(bodyPayload)
          .end((_err, res) => {
            assert.equal(res.status, 200);

            assert.isObject(res.body);
            assert.property(res.body, "title");
            assert.equal(res.body.title, "Faux Book 1");
            assert.property(res.body, "_id");

            chai
              .request(server)
              .keepOpen()
              .get(`/api/books/${res.body._id}`)
              .end((_err, res) => {
                assert.equal(res.status, 200);

                assert.isObject(res.body);
                assert.property(res.body, "title");
                assert.equal(res.body.title, "Faux Book 1");
                assert.property(res.body, "comments");
                assert.isArray(res.body.comments);

                done();
              });
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("Test POST /api/books/[id] with comment", function (done) {
          const bookPayload = {
            title: "Faux Book 1",
          };

          chai
            .request(server)
            .keepOpen()
            .post("/api/books")
            .send(bookPayload)
            .end((_err, res) => {
              assert.equal(res.status, 200);

              assert.isObject(res.body);
              assert.property(res.body, "title");
              assert.equal(res.body.title, "Faux Book 1");
              assert.property(res.body, "_id");

              const commentPayload = {
                comment: "This book is fab!",
              };

              chai
                .request(server)
                .keepOpen()
                .post(`/api/books/${res.body._id}`)
                .send(commentPayload)
                .end((_err, res) => {
                  assert.equal(res.status, 200);

                  assert.isObject(res.body);
                  assert.property(res.body, "_id");
                  assert.property(res.body, "title");
                  assert.property(res.body, "comments");
                  assert.lengthOf(res.body.comments, 1);

                  res.body.comments.forEach((comment) => {
                    assert.isString(comment);
                    assert.oneOf(comment, ["This book is fab!"]);
                  });

                  done();
                });
            });
        });

        test("Test POST /api/books/[id] without comment field", function (done) {
          const bodyPayload = {};

          chai
            .request(server)
            .keepOpen()
            .post("/api/books")
            .send(bodyPayload)
            .end((_err, res) => {
              assert.equal(res.status, 200);

              assert.isString(res.body);
              assert.equal(res.body, "missing required field title");

              done();
            });
        });

        test("Test POST /api/books/[id] with comment, id not in db", function (done) {
          const commentPayload = {
            comment: "This book is fab!",
          };

          chai
            .request(server)
            .keepOpen()
            .post("/api/books/5f665eb46e296f6b9b6a504d")
            .send(commentPayload)
            .end((_err, res) => {
              assert.equal(res.status, 200);

              assert.isString(res.body);
              assert.equal(res.body, "no book exists");

              done();
            });
        });
      },
    );

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", function (done) {
        const bookPayload = {
          title: "Faux Book 1",
        };

        chai
          .request(server)
          .keepOpen()
          .post("/api/books")
          .send(bookPayload)
          .end((_err, res) => {
            assert.equal(res.status, 200);

            assert.isObject(res.body);
            assert.property(res.body, "title");
            assert.equal(res.body.title, "Faux Book 1");
            assert.property(res.body, "_id");

            chai
              .request(server)
              .keepOpen()
              .delete(`/api/books/${res.body._id}`)
              .end((_err, res) => {
                assert.equal(res.status, 200);

                assert.isString(res.body);
                assert.equal(res.body, "delete successful");

                done();
              });
          });
      });

      test("Test DELETE /api/books/[id] with  id not in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .delete("/api/books/5f665eb46e296f6b9b6a504d")
          .end((_err, res) => {
            assert.equal(res.status, 200);

            assert.isString(res.body);
            assert.equal(res.body, "no book exists");

            done();
          });
      });
    });
  });
});
