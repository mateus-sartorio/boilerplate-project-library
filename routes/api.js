/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const { ObjectId } = require("mongodb");

module.exports = function (app, client) {
  const database = client.db("fccpersonallib").collection("books");

  app
    .route("/api/books")
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]

      const result = await database.find().toArray();

      const filteredResult = result.map((r) => {
        return {
          _id: r._id,
          title: r.title,
          commentcount: r.comments.length,
        };
      });

      res.status(200).json(filteredResult);
    })

    .post(async function (req, res) {
      try {
        let title = req.body.title;
        //response will contain new book object including atleast _id and title

        if (!title) {
          throw new Error();
        }

        const response = await database.insertOne({
          title,
          comments: [],
        });

        res.status(200).json({ _id: response.insertedId, title });
      } catch (e) {
        res.status(200).json("missing required field title");
      }
    })

    .delete(async function (req, res) {
      //if successful response will be 'complete delete successful'

      try {
        const result = await database.deleteMany({});

        res.status(200).json("complete delete successful");
      } catch (e) {
        res.status(200).json("complete delete successful");
      }
    });

  app
    .route("/api/books/:id")
    .get(async function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      try {
        const id = new ObjectId(bookid);

        const result = await database.findOne({ _id: id });

        const returnObjet = {
          _id: result._id,
          title: result.title,
          comments: result.comments,
        };

        res.status(200).json(returnObjet);
      } catch (e) {
        res.status(200).json("no book exists");
      }
    })

    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      if (!comment) {
        res.status(200).json("missing required field comment");
        return;
      }

      const result = await database.updateOne(
        { _id: new ObjectId(bookid) },
        {
          $push: {
            comments: comment,
          },
        },
      );

      if (result.modifiedCount === 0) {
        res.status(200).json("no book exists");
        return;
      }

      const book = await database.findOne({ _id: new ObjectId(bookid) });

      const returnObjet = {
        _id: book._id,
        title: book.title,
        comments: book.comments,
      };

      res.status(200).json(returnObjet);
    })

    .delete(async function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'

      try {
        const id = new ObjectId(bookid);

        const response = await database.deleteOne({
          _id: id,
        });

        if (response.deletedCount === 0) {
          throw new Error();
        }

        res.status(200).json("delete successful");
      } catch (e) {
        res.status(200).json("no book exists");
      }
    });
};
