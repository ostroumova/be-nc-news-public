const cors = require('cors');

const express = require('express');
const app = express();
app.use(cors());
app.use(express.json());


const {getTopics, getArticleById, patchArticleById, getUsers, getCommentsByArticle, getArticles, postComments, deleteComment, getEndpoints} = require('./controllers/news.js');



app.get('/api/topics', getTopics);
app.get('/api/articles/:article_id', getArticleById);
app.patch('/api/articles/:article_id', patchArticleById);
app.get('/api/users', getUsers);
app.get('/api/articles/:article_id/comments', getCommentsByArticle);
app.get('/api/articles', getArticles);
app.post('/api/articles/:article_id/comments', postComments);
app.delete('/api/comments/:comment_id', deleteComment)
app.get('/api', getEndpoints)


app.all('*', (req, res, next) => {
    res.status(404).send({ msg: "Not Found" }); 
  });  

  app.use((err, req, res, next) => {
    if (err.status && err.msg) {
      res.status(err.status).send({ msg: err.msg });
    } else next(err);
  });
  
  app.use((err, req, res, next) => {
 
    if (err.code === '22P02' || err.msg === "Bad request" || err.code === '23502') {
      res.status(400).send({ msg: 'Bad Request' });
    } else {
    res.status(500).send({ msg: 'Internal Server Error' });}
  });


module.exports = app;