import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function sendMultipartRequest() {
  const url = 'https://accident-alert.azurewebsites.net/report';
  const file = fs.createReadStream('readme.txt'); // Replace 'path/to/file' with the actual path to your file

  const formData = new FormData();
  formData.append('accidents', 'accidents string');
  formData.append('time', 'time string');
  formData.append('file', file);

  try {
    const response = await axios.post(url, formData, {
      headers: formData.getHeaders(),
    });

    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

sendMultipartRequest();