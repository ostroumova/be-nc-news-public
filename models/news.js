const {
  getTopics,
  getArticleById,
  patchArticleById,
  getUsers,
  getCommentsByArticle,
  getArticles,
  postComments,
  deleteComment,
  getEndpoints,
} = require("../controllers/news.js");
const db = require("../db/connection.js");
const articles = require("../db/data/test-data/articles.js");
const fs = require('fs/promises');

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      "SELECT articles.*, COUNT(comment_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id;",
      [article_id]
    )
    .then(({ rows }) => {
      const article = rows[0];
      if (!article) {
        return Promise.reject({
          status: 404,
          msg: "Not Found",
        });
      }
      article.comment_count = Number(article.comment_count);
      return article;
    });
};

exports.updateArticleById = (votes, article_id) => {
  if (!votes) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  if (typeof votes !== "number") {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }
  return db
    .query(
      "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;",
      [votes, article_id]
    )
    .then(({ rows }) => {
      const article = rows[0];
      if (!article) {
        return Promise.reject({
          status: 404,
          msg: "Not Found",
        });
      }

      return article;
    });
};

exports.selectUsers = () => {
  return db.query("SELECT * FROM users;").then(({ rows }) => {
    return rows;
  });
};

exports.selectCommentsByArticle = (article_id) => {
  return db
    .query(
      "SELECT comments.comment_id, comments.votes, comments.created_at, comments.author, comments.body FROM comments LEFT JOIN users ON comments.author = users.username WHERE article_id = $1 ;",
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.selectArticles = (sort_by = "created_at", order = "DESC", topic) => {
  const queryValue = [];
  const validSorts = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrders = ["ASC", "DESC"];
  let queryStr = `SELECT articles.*, COUNT(comment_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id `;

  if (!validOrders.includes(order)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  if (!validSorts.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  if (topic) {
    queryValue.push(topic);
    queryStr += `WHERE articles.topic = $1 `;
  }

  queryStr += `GROUP BY articles.article_id ORDER BY ${sort_by} ${order}`;

  return db.query(queryStr, queryValue).then((result) => {
    return result.rows;
  });
};

exports.insertComments = (comment, article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then(({ rows }) => {
      const article = rows[0];
      if (!article) {
        return Promise.reject({
          status: 404,
          msg: "Not Found",
        });
      }
      return db.query(
        "INSERT INTO comments (body, author, article_id) VALUES ($1, $2, $3) RETURNING *;",
        [comment.body, comment.username, article_id]
      );
    })
    .then(({ rows }) => rows[0]);
};

exports.removeComment = (comment_id) => {
  if (typeof +comment_id !== "number") {
    return Promise.reject({
      status: 400,
      msg: "Bad Request",
    });
  }

  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *", [
      comment_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Not Found",
        });
      }
      return rows;
    });
};

exports.selectEndpoints = () => {
  return fs.readFile("./endpoints.json", 'utf-8')
    .then((data) => {
      return JSON.parse(data);
    })
  }
