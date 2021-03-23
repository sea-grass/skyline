import Router from "./router";
const {generateImageBuffer, generateGifBuffer} = require('./generate');

const {debug} = require('./debug');

function pageTemplate(locals) {
  const { path = "/", image_data = "", styles = "", script = "" } = locals;

  const html = `
<!doctype html>
    <head>
    <title>Generative skyline</title>
    <style>${styles}</style>
    </head>
    <body>
    <h1>Generative skyline</h1>
    <ul>
    <li>
    <a href="/image-viewer" class="${path==="/image-viewer"?"active":""}">
    Image Viewer</a>
    <a href="/gif-viewer" class="${path==="/gif-viewer"?"active":""}">
    Gif Viewer</a>
    <img src="${image_data}"/>
    <p>Made by <a href="https://github.com/sea-grass">sea-grass</a></p>
    <script>${script}</script>
  `;

  return html;
}
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

debug("Starting up");

addEventListener("fetch", event => {
  console.log("Got fetch");
  debug("Received fetch");
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const r = new Router();

  r.get("/", redirect("/image-viewer"));
  r.get("/image-viewer", imageViewer);
  r.get("/gif-viewer", gifViewer);

  debug("Routing request");
  let response = await r.route(request);

  if (!response) {
    response = new Response("Not found", {status: 404 });
  }

  return response;
}

function redirect(url) {
  debug("Redirecting from root path");
  return (_) => new Response("", {
    status: 302,
    headers: {
      "Location": "/image-viewer"
    }
  });
}

async function imageViewer(_) {
  debug("rendering image page");
  let buf = Buffer.from("");
  try {
    buf = await generateImageBuffer();
  } catch(e) {
    debug("Could not render image", e);
  }

  const base64_image = "data:image/png;base64," + buf.toString('base64');
  const html = pageTemplate({
    styles,
    script: "",
    path: "/image-viewer",
    image_data: base64_image
  });

  console.log(html);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html"
    }
  });
}

async function gifViewer(_) {
  let buf = Buffer.from("");
  try {
    buf = await generateGifBuffer();
  }
  catch (e) {
    console.error("Could not produce a gif", e.message);
  }

  const base64_image = "data:image/gif;base64," + buf.toString("base64");
  const html = pageTemplate({
    styles,
    script: "",
    path: "/gif-viewer",
    image_data: base64_image
  });
  return new Response(html, {
    headers: {
      "Content-Type": "text/html"
    }
  });
}
