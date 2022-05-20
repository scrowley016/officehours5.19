const express = require("express");
const app = express();

const db = require("./db");
const { conn, Bookmark, Category } = db;

app.get("/", (req, res) => res.redirect("/bookmarks"));

app.get("/bookmarks", async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.findAll({
      include: [Category],
    });
    const cat = await Category.findAll();

    res.send(`
      <html>
        <head>
          <title>Bookmarker</title>
        </head>
        <body>
          <h1>Bookmarker</h1>
          ${bookmarks
            .map((bookmark) => {
              return `<li>
                ${bookmark.name} 
                <a href='/categories/${bookmark.categoryId}'>${bookmark.category.name}</a>
              </li>`;
            })
            .join("")}



        <form method="POST">
            <select name="name">
            ${cat.map((bookmark) => {
              return `<option value=${bookmark.name}>${bookmark.name}</option>`;
            })}
            </select>
            <input name="url" value="amazon.com"></input>
            <button>SUBMIT</button>
        </form>



        </body>
      </html>
    `);
  } catch (ex) {
    next(ex);
  }
});

app.get("/categories/:id", async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [Bookmark],
    });
    res.send(`
      <html>
        <head>
          <title>Bookmarks for ${category.name}</title>
        </head>
        <body>
          <h1>Bookmarks for ${category.name}</h1>
          <a href='/bookmarks'>All Bookmarks</a>
          <ul>
            ${category.bookmarks
              .map((bookmark) => {
                return `
                  <li>
                    ${bookmark.name}
                  </li>
                `;
              })
              .join("")}
          </ul>
        <body>
      </html>
    `);
  } catch (ex) {
    next(ex);
  }
});

app.post("/bookmarks", async (req, res, next) => {
  try {
    console.log("HELLOOOOOOOOOO", req);
    await Bookmark.create(req.body);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  try {
    await conn.sync({ force: true });
    const coding = await Category.create({ name: "coding" });
    const search = await Category.create({ name: "search" });
    const shop = await Category.create({ name: "shop" });

    await Bookmark.create({
      name: "mdn",
      url: "https://developer.mozilla.org/en-US/",
      categoryId: coding.id,
    });
    await Bookmark.create({
      name: "Stack Overflow",
      url: "https://stackoverflow.com/",
      categoryId: coding.id,
    });
    await Bookmark.create({
      name: "Google",
      url: "https://www.google.com",
      categoryId: search.id,
    });
    await Bookmark.create({
      name: "Bing",
      url: "https://www.bing.com",
      categoryId: search.id,
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
  } catch (ex) {
    console.log(ex);
  }
};

init();
