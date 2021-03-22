const Jimp = require('jimp');
const {BitmapImage, GifFrame, GifUtil, GifCodec } = require("gifwrap");
const DEBUG=  false;

const width = 200;
const height = 200;
function generateImage() {
  const image = new Jimp(width, height, (err, image) => {
    if (err) throw err;
  });

  const sun_width = width/3;
  const border_colour = 255;
  const sun_colour = 0xffa500ff;
  const skyline_colour = 0x9999ffff;
  const sparkle_colour = 0xfffb66ff;
  const water_colour = 0x0000ffff;
  // random horizon line
  //const horizon_line = (Math.random()*20)+30;
  const horizon_line = 25;
  // draw skyline
  for (let y = 0; y < horizon_line; y++) {
    const min_pole = sun_width + (sun_width*(1/(y+1)));
    const max_pole = width - sun_width - (sun_width*(1/(y+1)));
    for (let x = 0; x < width; x++) {
      if (DEBUG && y%10===0) {
        image.setPixelColor(border_colour, x, y);
      }
      else if (x > min_pole && x < max_pole) {
        image.setPixelColor(sun_colour, x, y);
      } else {
        image.setPixelColor(skyline_colour, x, y);
      }
    }
  }
  // draw water
  for (let y = horizon_line; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const adjustment = 0.1;
      const prob_of_sparkle = 1/(y+2-horizon_line-adjustment);
      const random_number = Math.random();
      if (DEBUG && y%10===0) {
        image.setPixelColor(border_colour, x, y);
      }
      else if (random_number < prob_of_sparkle) {
        image.setPixelColor(sparkle_colour, x, y);
      } else {
        image.setPixelColor(water_colour, x, y);
      }
    }
  }

  return image;
}
function generateImageBuffer(DEBUG = false) {
  const image = generateImage();

  return new Promise((resolve, reject) => {
    image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
      if (err) reject(err);
      else resolve(Buffer.from(buffer));
    });
  });
}

function generateGifBuffer(DEBUG = false, num_frames = 1) {
  return new Promise(async (resolve, reject) => {
    const frames = [];

    for (let i = 0; i < 10; i++) {
      const image = await generateImage();
      const frame = new GifFrame(new BitmapImage(image.bitmap));
      // To make the animation "slower" we just add it as multiple frames
      frames.push(frame);
      frames.push(frame);
      frames.push(frame);
    }

    const codec = new GifCodec();
    resolve(codec.encodeGif(frames).then(gif => gif.buffer));
  });
}

module.exports = {
  generateImageBuffer,
  generateGifBuffer
};
