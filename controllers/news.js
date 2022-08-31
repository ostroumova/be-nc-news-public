const {
  selectTopics,
  selectArticleById,
  updateArticleById,
  selectUsers,
  selectCommentsByArticle,
  selectArticles,
  insertComments,
  removeComment,
  selectEndpoints
} = require("../models/news.js");

exports.getTopics = (request, response, next) => {
  selectTopics()
    .then((topics) => {
      response.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  updateArticleById(inc_votes, article_id)
    .then((update) => {
      res.status(200).send(update);
    })
    .catch(next);
};

exports.getUsers = (request, response, next) => {
  selectUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsByArticle = (req, res, next) => {
  const { article_id } = req.params;

  const promise1 = selectArticleById(article_id);
  const promise2 = selectCommentsByArticle(article_id);
  Promise.all([promise1, promise2])
    .then((dbResponse) => {
      const comments = dbResponse[1];
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (request, response, next) => {
  const { sort_by } = request.query;
  const { order } = request.query;
  const { topic } = request.query;

  selectArticles(sort_by, order, topic)
    .then((articles) => {
      response.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postComments = (req, res, next) => {
  const { article_id } = req.params;
  const { body } = req;

  insertComments(body, article_id)
    .then((comment) => res.status(201).send(comment))
    .catch((err) => {
      next(err);
    });
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
 
  removeComment(comment_id)
    .then((rows) => {
        res.status(204).send()
    })
    .catch((err) => {
      next(err);
    });
};

exports.getEndpoints  = (request, response, next) => {
  selectEndpoints()
    .then((endpoints) => {
      response.status(200).send({ endpoints });
    })
    .catch((err) => {
      next(err);
    });
};