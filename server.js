const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));


// ===============================
// TEST
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Media API aktif"
  });
});


app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Media API berhasil bekerja"
  });
});


// ===============================
// DOWNLOAD MEDIA
// ===============================
//
// URL harus berupa file/media yang
// memang boleh Anda unduh/proses.
//
// Contoh:
// https://domain.com/video.mp4
//
// ===============================

app.post("/api/download", async (req, res) => {

  try {

    const { sourceUrl, format } = req.body;

    if (!sourceUrl) {
      return res.status(400).json({
        success: false,
        error: "sourceUrl wajib diisi."
      });
    }

    let parsed;

    try {
      parsed = new URL(sourceUrl);
    } catch {
      return res.status(400).json({
        success: false,
        error: "URL tidak valid."
      });
    }


    // Hanya HTTP/HTTPS
    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return res.status(400).json({
        success: false,
        error: "URL harus menggunakan HTTP atau HTTPS."
      });
    }


    const allowedFormats = [
      "mp4",
      "mp4-1080",
      "mp4-720",
      "mp4-480",
      "mp4-360",
      "mp4-240",
      "mp4-144",
      "m4a",
      "mp3",
      "mp3-128",
      "m4a-128",
      "m4a-48"
    ];


    if (!format || !allowedFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: "Format tidak tersedia."
      });
    }


    /*
     * Backend ini tidak melakukan
     * ekstraksi YouTube.
     *
     * Ia hanya mengambil media dari
     * URL yang memang dapat diakses
     * secara langsung.
     */


    const response = await fetch(sourceUrl, {
      method: "GET",
      redirect: "follow"
    });


    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error:
          "Media tidak dapat diambil. HTTP " +
          response.status
      });
    }


    const contentType =
      response.headers.get("content-type") || "";


    /*
     * Pastikan URL memang mengarah
     * ke media.
     */

    const mediaType =
      contentType.startsWith("video/") ||
      contentType.startsWith("audio/");


    if (!mediaType) {
      return res.status(400).json({
        success: false,
        error:
          "URL tersebut tidak mengarah ke file video/audio langsung."
      });
    }


    /*
     * Batas 100 MB untuk contoh.
     */

    const contentLength =
      response.headers.get("content-length");

    if (
      contentLength &&
      Number(contentLength) > 100 * 1024 * 1024
    ) {
      return res.status(413).json({
        success: false,
        error:
          "File terlalu besar. Maksimum 100 MB."
      });
    }


    const extension =
      getExtension(contentType);


    const filename =
      "media-" +
      crypto.randomBytes(8).toString("hex") +
      extension;


    /*
     * Untuk file kecil, kita teruskan
     * langsung ke browser.
     */

    res.setHeader(
      "Content-Type",
      contentType
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );


    if (!response.body) {
      return res.status(500).json({
        success: false,
        error: "Response media tidak memiliki body."
      });
    }


    /*
     * Node.js ReadableStream
     * diteruskan ke response.
     */

    const reader =
      response.body.getReader();


    while (true) {

      const { done, value } =
        await reader.read();

      if (done) break;

      res.write(Buffer.from(value));

    }


    res.end();


  } catch (error) {

    console.error(error);

    if (!res.headersSent) {

      return res.status(500).json({
        success: false,
        error: "Terjadi kesalahan pada server."
      });

    }

    res.end();

  }

});


// ===============================
// EXTENSION
// ===============================

function getExtension(contentType) {

  const type =
    contentType.split(";")[0].trim();


  const extensions = {

    "video/mp4": ".mp4",

    "video/webm": ".webm",

    "video/quicktime": ".mov",

    "audio/mpeg": ".mp3",

    "audio/mp3": ".mp3",

    "audio/mp4": ".m4a",

    "audio/x-m4a": ".m4a",

    "audio/wav": ".wav",

    "audio/ogg": ".ogg"

  };


  return extensions[type] || ".bin";

}


// ===============================
// START
// ===============================

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `Media API berjalan pada port ${PORT}`
  );

});
