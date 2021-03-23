const express = require('express');
const app = express();
const pug = require('pug');

const {debug} = require('./debug');
const {generateImageBuffer, generateGifBuffer} = require('./generate');


const page_template = pug.compile(`
html
  head
    title Generative skyline
    style
      != styles
  body
    h1 Generative skyline
    ul
      li
        a(href="/image-viewer", class=path==="/image-viewer"?"active":"") Image Viewer
      li
        a(href="/gif-viewer", class=path==="/gif-viewer"?"active":"") Gif Viewer
    img(src=image_data)
    p Made by
      a(href="https://github.com/sea-grass") sea-grass
  script
    != script
`, {});
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Ubuntu+Mono&family=Prompt:wght@400&display=swap');
body {
  font-family: 'Prompt', sans-serif;
  background-color: white;
  width: 800px;
  max-width: 70vh;
  text-align: center;
  margin: 0 auto;
}
img {
  width: 100%;
  border: 1em solid black;
}
ul {
  list-style: none;
  display: flex;
}
li {
  padding: 1em 1em 0 0;
}
a, a:visited, a:active, a:hover, a:focus {
  font-family: 'Ubuntu Mono', serif;
  text-decoration: none;
  color: black;
  margin-left: 0.5em;
}
a:before {
  content: '| ';
}
a:hover::before, a:active::before, a:focus::before {
  content: '> ';
  outline: none;
}
`;
const script = `
const interval = setInterval(replaceImage, 1000);

function replaceImage() {
  const img = document.querySelector('img');
  fetch('/image')
  .then(res => res.blob())
  .then(binary_data => {
    const url = URL.createObjectURL(binary_data);
    img.src = url;
  })
}
`;

const redirect = url => (_, res) => res.redirect(302, url);

app.get('/', redirect("/image-viewer"));
app.get('/image-viewer', async (req, res) => {
  let buf = Buffer.from("");
  try {
    buf = await generateImageBuffer();
  } catch(e) {
    console.error("Could not produce an image.", e);
    res.writeHead(500, null);
    res.end();
  }

  const base64_image = "data:image/png;base64," + buf.toString('base64');
  const html = page_template({
    styles,
    script: "",
    path: "/image-viewer",
    image_data: base64_image
  });

  res.writeHead(200, null, {
    'Content-Type': 'text/html'
  });

  res.write(html);

  res.end();
});

app.get("/gif-viewer", async (req, res) => {
  let buf = Buffer.from("");
  try {
    buf = await generateGifBuffer();
  }
  catch (e) {
    console.error("Could not produce a gif", e);
    res.writeHead(500, null);
    res.end();
  }

  const base64_image = "data:image/gif;base64," + buf.toString("base64");
  const html = page_template({
    styles,
    script: "",
    path: "/gif-viewer",
    image_data: base64_image
  });

  res.writeHead(200, null, {
    "Content-Type": "text/html"
  });

  res.write(html);

  res.end();
});

app.get("/image", async (req, res) => {
  const image = await generateImageBuffer();

  res.writeHead(200, null, {
    "Content-Type": "image/png"
  });

  res.write(image);

  res.end();
});

app.listen(8000, () => {
  console.log("Now listening on port 8000");
});

