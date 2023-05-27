//Packages
const readline = require('readline');
const prompt = require('prompt-sync')();
const axios = require('axios');
const urlShortener = require('node-url-shortener');
const fs = require('fs');
const { url } = require('inspector');
const path = require('path');



// Ask the user for the URL
function convertUrl() {
  return new Promise((resolve, reject) => {
    const url = prompt('Enter your URL: ');
    console.log('<--------------------------------------->');
    urlShortener.short(url, function (err, shortUrl) {
      if (err) {
        reject(new Error('URL shortening error'));
      } else {
        resolve({originalUrl: url, shortUrl: shortUrl});
      }
    });
  });
}


// Create the data object
const setup_data = {
  original_links: [],
  shortened_links: []
};


// Write links to libraries
function write_links() {
  return new Promise((resolve, reject) => {
    const current_dir = fs.readdirSync(__dirname);
    // Set up open file array
    let open_file = [];
    // Get json files
    const jsonFiles = current_dir.filter((file) => {
      return fs.statSync(file).isFile() && file.endsWith('.json');
    });
    console.log('');
    console.log('Current libraries:');
    console.log('<--------------------------------------->');
    let i = 0;
    jsonFiles.forEach((file) => {
      console.log(i, '.', ' ', file);
      open_file[i] = file;
      i++;
    });
    // Set up json save settings
    console.log('Enter the number corresponding to the library to save your link to');
    const lib_pick = parseInt(prompt("Enter the library you want to use: "));

    // Check if the library index is valid
    if (lib_pick >= 0 && lib_pick < jsonFiles.length) {
      const selectedFile = jsonFiles[lib_pick];
      const filePath = path.join(__dirname, selectedFile);

      // Read the existing JSON data
      const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Ask for URL
      const url = prompt('Enter your URL: ');
      console.log('<--------------------------------------->');
      console.log('Your URL:', url);

      // Generate short URL
      urlShortener.short(url, function (err, shortUrl) {
        if (err) {
          reject(new Error('URL shortening error'));
        } else {
          console.log('Short URL:', shortUrl);

          // Add URL and short URL to existing data
          existingData.original_links.push(url);
          existingData.shortened_links.push(shortUrl);

          // Write the updated JSON data back to the file
          fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

          resolve(); // Resolve the promise without passing any value
        }
      });
    } else {
      reject(new Error('Invalid library index'));
    }
  });
}

//Open a library
function open_library() {
  // List all libraries
  const current_dir = fs.readdirSync(__dirname);
  const jsonFiles = current_dir.filter((file) => {
    return fs.statSync(file).isFile() && file.endsWith('.json');
  });
  let i = 0;
  console.log('');
  console.log('Current libraries:');
  console.log('<--------------------------------------->');
  // Create open file array
  open_file = [];
  // List all files
  jsonFiles.forEach((file) => {
    console.log(i, '.', ' ', file);
    open_file[i] = file;
    i++;
  });
  console.log('Enter the number corresponding to the library to open');
  const lib_pick = parseInt(prompt('Enter the library you want to open: '));
  // Create a full filepath to open
  const filePath = path.join(__dirname, jsonFiles[lib_pick]);
  // Get file contents
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const dataArray = JSON.parse(fileContents);
  console.log('<--------------------------------------->');
  console.log('______Original links______    ______Shortened links______');
  if (Array.isArray(dataArray.original_links) && Array.isArray(dataArray.shortened_links)) {
    const original_linksArray = dataArray.original_links;
    const shortened_linksArray = dataArray.shortened_links;
    for (let index = 0; index < original_linksArray.length; index++) {
      const OL_element = original_linksArray[index];
      const SL_element = shortened_linksArray[index];
      console.log(OL_element + '                 ' + SL_element);
    }
  } else {
    console.error('Error opening the JSON file: Invalid JSON format');
  }
}






//Manage link librarys
function create_library() {
    const lib_name = prompt('Enter library name: ');
    const filepath = `./${lib_name}.json`;

    // Check if file exists
    const exists = fs.existsSync(filepath);
    if (exists) {
      console.log('Library already exists.');
      console.log('<--------------------------------------->');
      const edit = prompt('Would you like to reset this library? (y,n): ');
      //Continue
      if (edit === 'y') {
        //Rewrite library
        fs.writeFileSync(filepath, JSON.stringify(setup_data, null, 2));
        console.log('Library "${lib_name}" reset successfully');
      }
      return;
    }

    // Write data to JSON file
    fs.writeFileSync(filepath, JSON.stringify(setup_data, null, 2));

    console.log(`Library "${lib_name}" created successfully`);
}

// List commands
function list_commands() {
  console.log('1. Make a short URL "DOES NOT SAVE"');
  console.log('2. Create a hort URL and save it to a library');
  console.log('3. Create a library to store links');
  console.log('4. Open a library with saved links');
}

// Run functions
async function start() {
  let restart = true;

  while (restart) {
    list_commands();
    const commandId = parseInt(prompt('Enter the command you want to execute: '));

    if (commandId === 1) {
      try {
        const { originalUrl, shortUrl} = await convertUrl();
        console.log('Your URL:', originalUrl);
        console.log('Shortened URL:', shortUrl);
        //Space out
        console.log('<--------------------------------------->');
      } catch (error) {
        console.log('Error:', error.message);
        console.log('<--------------------------------------->');
      }
    }

    if (commandId === 2) {
      try {
        await write_links();
        console.log('<--------------------------------------->');
      } catch (error) {
        console.log('ERROR:', error.message);
        console.log('<--------------------------------------->');
      }
    }

    if (commandId === 3) {
      try {
        create_library();
        console.log('<--------------------------------------->');
      } catch (error) {
        console.log('ERROR:', error.message);
        console.log('<--------------------------------------->');
      }
    }

    if (commandId === 4) {
      try {
        open_library();
        console.log('<--------------------------------------->');
      } catch (error) {
        console.log("ERROR:", error.message);
        console.log('<--------------------------------------->');
      }
    }
  }
}

start();