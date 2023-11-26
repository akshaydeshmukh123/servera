const express=require("express")

const fs = require("fs");
const csvParser = require("csv-parser");
const files = require('../models/Csv.Model');


const FileRouter = express.Router();

FileRouter.use(express.json());

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null,'./uploads' );
 
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });




//EXPORTING FUNCTION To upload a file
 FileRouter.post("/upload", upload.single('file'), async (req, res) => {
   try {
     // file is not present
     if (!req.file) {
       return res.status(400).send("No files were uploaded.");
     }
     // file is not csv
     if (req.file.mimetype != "text/csv") {
       return res.status(400).send("Select CSV files only.");
     }
     // console.log(req.file);
     let file = await files.create({
       fileName: req.file.originalname,
       filePath: req.file.path,
       file: req.file.filename,
     });

     return res.redirect("/");
   } catch (error) {
     console.log("Error in Filerouter upload", error);
     res.status(500).send("Internal server error");
   }
 });

//EXPORTING FUNCTION To open file viewer page
FileRouter.get("/view/:id",async (req, res) =>{
  try {
    // console.log(req.params);
    let csvFile = await files.findOne({ file: req.params.id });
    // console.log(csvFile);
    const results = [];
    const header = [];
    fs.createReadStream(csvFile.filePath) //seeting up the path for file upload
      .pipe(csvParser())
      .on("headers", (headers) => {
        headers.map((head) => {
          header.push(head);
        });
        // console.log(header);
      })
      .on("data", (data) => results.push(data))
      .on("end", () => {
        // console.log(results.length);
        // console.log(results);
        res.render("file_viewer", {
          title: "File Viewer",
          fileName: csvFile.fileName,
          head: header,
          data: results,
          length: results.length,
        });
      });
  } catch (error) {
    console.log("Error in FileRouter view", error);
    res.status(500).send("Internal server error");
  }
})

//EXPORTING FUNCTION To delete the file 
FileRouter.get("/deletes/:id", async  (req, res) =>{
  try {
    // console.log(req.params);
    let isFile = await files.findOne({ file: req.params.id });

    if (isFile) {
      await files.deleteOne({ file: req.params.id });
      return res.redirect("/");
    } else {
      console.log("File not found");
      return res.redirect("/");
    }
  } catch (error) {
    console.log("Error in FileRouter Delete", error);
    return;
  }
})

module.exports=FileRouter