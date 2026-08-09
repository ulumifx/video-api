const express = require("express");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());


// ==============================
// HALAMAN UTAMA
// ==============================

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "Video API aktif"
  });

});


// ==============================
// TEST API
// ==============================

app.get("/api/test", (req, res) => {

  res.json({
    success: true,
    message: "API berhasil bekerja"
  });

});


// ==============================
// DOWNLOAD API
// ==============================

app.post("/api/download", (req, res) => {

  const {
    sourceUrl,
    format
  } = req.body;


  if (!sourceUrl) {

    return res.status(400).json({
      success: false,
      error: "URL belum diberikan."
    });

  }


  if (!format) {

    return res.status(400).json({
      success: false,
      error: "Format belum dipilih."
    });

  }


  const formats = [
    "mp4-1080",
    "mp4-720",
    "mp4-480",
    "mp4-360",
    "mp4-240",
    "mp4-144",
    "m4a-48",
    "m4a-128",
    "mp3-128"
  ];


  if (!formats.includes(format)) {

    return res.status(400).json({
      success: false,
      error: "Format tidak tersedia."
    });

  }


  /*
   * Untuk sementara hanya menguji
   * apakah API menerima request.
   */

  res.json({

    success: true,

    message: "Request diterima.",

    format: format,

    source_url: sourceUrl

  });

});


// ==============================
// JALANKAN SERVER
// ==============================

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `Server berjalan pada port ${PORT}`
  );

});
