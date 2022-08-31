const request = require("supertest");
const app = require("./app");
const db = require("./db/connection.js");

const seed = require("./db/seeds/seed");
const testData = require("./db/data/test-data/index");

require("jest-sorted");

beforeEach(() => seed(testData));
afterAll(() => {
  if (db.end) db.end();
});

describe("1. GET /api/topics", () => {
  test("status:200, responds with an array of topic objects with `description` and `slug properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).toBeInstanceOf(Array);
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
  test("status: 404 for the invalid request", () => {
    return request(app)
      .get("/api/notARoute")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("2. GET /api/articles/:article_id", () => {
  test("status:200, responds with a single matching article", () => {
    const ARTICLE_ID = 1;
    return request(app)
      .get(`/api/articles/${ARTICLE_ID}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toHaveProperty("article_id");
        expect(body.article).toHaveProperty("author");
        expect(body.article).toHaveProperty("title");
        expect(body.article).toHaveProperty("body");
        expect(body.article).toHaveProperty("topic");
        expect(body.article).toHaveProperty("created_at");
        expect(body.article).toHaveProperty("votes");
        expect(body.article).toHaveProperty("comment_count");
        expect(body.article.comment_count).toBe(11);
      });
  });
  test("status:400, responds with an error message when passed a bad article ID", () => {
    return request(app)
      .get("/api/articles/notAnID")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("should return status 404 given valid but nonexisting id", () => {
    return request(app)
      .get("/api/articles/77777")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("3. PATCH /api/articles/:article_id", () => {
  test("status: 200, responds with the updated article", () => {
    const newVote = { inc_votes: 4 };
    return request(app)
      .patch(`/api/articles/3`)
      .send(newVote)
      .expect(200)
      .then(({ body }) => {
        expect(body.votes).toEqual(4);
      });
  });
  test("value is not a number: 400 Bad Request", () => {
    const newVote = { inc_votes: "word" };
    return request(app)
      .patch(`/api/articles/3`)
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("malformed body / missing required fields: 400 Bad Request", () => {
    const newVote = { inc_votez: 4 };
    return request(app)
      .patch(`/api/articles/3`)
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("status:400, responds with an error message when passed a bad article ID", () => {
    return request(app)
      .get("/api/articles/notAnID")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("should return status 404 given valid but nonexisting id", () => {
    return request(app)
      .get("/api/articles/77777")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("4. GET /api/users", () => {
  test("status:200, responds with an array of users objects with `username`, `name`, `avatar_url`", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toBeInstanceOf(Array);
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
  test("status: 404 for the invalid request", () => {
    return request(app)
      .get("/api/notARoute")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("5. GET /api/articles/:article_id/comments", () => {
  test("status:200, responds with an array of comments for the given article_id with `comment_id`, `votes`, `created_at`, `author`, `body` properties", () => {
    return request(app)
      .get(`/api/articles/1/comments`)
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeInstanceOf(Array);
        expect(comments.length).toBeGreaterThan(0);
        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
            })
          );
        });
      });
  });
  test("should return status 404 given valid but nonexisting id", () => {
    return request(app)
      .get("/api/articles/77777/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("status:400, responds with an error message when passed a bad article ID", () => {
    return request(app)
      .get("/api/articles/notAnID/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test('status:200, responds with "happy" status if there are no comments for the article', () => {
    const ARTICLE_ID = 2;
    return request(app)
      .get(`/api/articles/${ARTICLE_ID}/comments`)
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);
        expect(body.comments.length).toBe(0);
      });
  });
});

describe("6. GET /api/articles", () => {
  test("status:200, responds with an array of articles objects with `author`, `title`, `article_id`, `topic`, `created_at`, `votes`, `comment_count` ", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              comment_count: expect.any(String),
            })
          );
        });
      });
  });
  test("status: 404 for the invalid request", () => {
    return request(app)
      .get("/api/notARoute")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("7. POST /api/articles/:article_id/comments", () => {
  test("status:201, responds with comment newly added to the database", () => {
    const newComment = {
      username: "icellusedkars",
      body: "We are helping you succeed;)",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body).toEqual({
          comment_id: 19,
          author: "icellusedkars",
          article_id: 2,
          votes: 0,
          created_at: expect.any(String),
          body: "We are helping you succeed;)",
        });
      });
  });
  test("malformed body / missing required fields: 400 Bad Request", () => {
    const newComment = {
      notAUsername: "icellusedkars",
      body: "We are helping you succeed;)",
    };
    return request(app)
      .post(`/api/articles/2/comments`)
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("status: 404 for the invalid request", () => {
    return request(app)
      .post("/api/articles/notARoute")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("status: 404 for the article that is valid but doesn't exist in the db", () => {
    return request(app)
      .post("/api/articles/99999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("8. GET /api/articles (queries)", () => {
  test('responds with the articles sorted in default order, "created_at"', () => {
    return request(app)
      .get("/api/articles/")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test('responds with the articles sorted by valid sort order, "votes"', () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("votes", { descending: true });
      });
  });
  test("responds with the articles sorted in `asc` or `desc` order (defaults to descending)", () => {
    return request(app)
      .get("/api/articles?order=DESC")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("responds with the error if any irrelavant input is insert in sort_by )", () => {
    return request(app)
      .get("/api/articles?sort_by=nonsense")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("responds with the error if any irrelavant input is insert in order_by )", () => {
    return request(app)
      .get("/api/articles?order=nonsense")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("responds with articles, filtered by the topic value specified in the query)", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(Array.isArray(articles)).toBe(true);
        expect(articles.length).toBe(1);
      });
  });
});

describe("9. DELETE /api/comments/:comment_id", () => {
  test("status:204 and no content", () => {
    return request(app)
    .delete("/api/comments/2")
    .expect(204)
  })
  test("if comment does not exist return 404 Not Found", () => {
    return request(app)
    .delete("/api/comments/999999999")
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe("Not Found");
    });
  })
  test("if comment_id is invalid return 400 Bad Request", () => {
    return request(app)
    .delete("/api/comments/notAnId")
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe("Bad Request");
    });
  })
})

describe("GET /api", () => {
  test("Responds with the endpoints contained in the JSON file", () => {
    return request (app)
    .get("/api")
    .expect(200)
    .then(({body}) => {
      const {endpoints} = body;
      expect(endpoints).toEqual({
        "GET /api": {
          "description": "serves up a json representation of all the available endpoints of the api"
        },
        "GET /api/topics": {
          "description": "serves an array of all topics",
          "queries": [],
          "exampleResponse": {
            "topics": [{ "slug": "football", "description": "Footie!" }]
          }
        },
        "GET /api/articles": {
          "description": "serves an array of all topics",
          "queries": ["author", "topic", "sort_by", "order"],
          "exampleResponse": {
            "articles": [
              {
                "title": "Seafood substitutions are increasing",
                "topic": "cooking",
                "author": "weegembump",
                "body": "Text from the article..",
                "created_at": 1527695953341
              }
            ]
          }
        },
        "GET /api/articles/:article_id": {
          "description": "responds with a single matching article",
          "queries": ["article_id"],
          "exampleResponse": {
            "title": "Seafood substitutions are increasing",
            "topic": "cooking",
            "author": "weegembump",
            "body": "Text from the article..",
            "created_at": 1527695953341
          }
        },
        "PATCH /api/articles/:article_id": {
          "description": "responds with the updated article",
          "queries": ["article_id"],
          "exampleResponse": {
            "article_id": 3,
            "title": "Eight pug gifs that remind me of mitch",
            "topic": "mitch",
            "author": "icellusedkars",
            "body": "some gifs",
            "created_at": "2020-11-03T09:12:00.000Z",
            "votes": 4
          }
        },
        "GET /api/users": {
          "description": "responds with an array of users objects with `username`, `name`, `avatar_url` properties",
          "queries": "",
          "exampleResponse": [
            {
              "username": "butter_bridge",
              "name": "jonny",
              "avatar_url": "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
            }
          ]
        },
        "GET /api/articles/:article_id/comments": {
          "description": "responds with an array of comments for the given article_id with `comment_id`, `votes`, `created_at",
          "queries": ["article_id"],
          "exampleResponse": [
            {
              "comment_id": 2,
              "votes": 14,
              "created_at": "2020-10-31T03:03:00.000Z",
              "author": "butter_bridge",
              "body": "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky."
            }
          ]
        },
        "POST /api/articles/:article_id/comments": {
          "description":"responds with comment newly added to the database",
          "queries":["article_id"],
          "exampleResponse":{
            "comment_id": 19,
            "body": "We are helping you succeed;)",
            "article_id": 2,
            "author": "icellusedkars",
            "votes": 0,
            "created_at": "2022-08-18T18:59:56.917Z"
          }
        },
        "DELETE /api/comments/:comment_id": {
          "description":"status:204 and no content",
          "queries":["article_id"],
          "exampleResponse":"no content"
        }
      })
    })
  })
})
